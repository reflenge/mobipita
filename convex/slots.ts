import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";
import { slotStatus, slotVisibility } from "./values";
import type { Id } from "./_generated/dataModel";

/**
 * 予約枠を一括作成する。
 * フォームの dateTimeSlots を展開して個々の枠を生成し、
 * policySnapshot（slotTemplate 全体）と locationSnapshot は JSON.stringify で保存する。
 */
export const createBatch = mutation({
    args: {
        tenantId: v.id("Tenants"),
        serviceId: v.id("Services"),
        slots: v.array(
            v.object({
                locationId: v.id("Locations"),
                startAt: v.string(),
                endAt: v.string(),
                slotStatus: slotStatus,
                visibility: slotVisibility,
                capacity: v.number(),
                policySnapshot: v.string(),
                locationSnapshot: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const createdByUserId = await requireClerkUserId(ctx);

        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new Error("テナントが見つかりません");
        }

        const service = await ctx.db.get(args.serviceId);
        if (!service || service.tenantId !== args.tenantId) {
            throw new Error("サービスが見つからないか、このテナントに属していません");
        }

        const insertedIds: import("./_generated/dataModel").Id<"Slots">[] = [];
        for (const slot of args.slots) {
            const id = await ctx.db.insert("Slots", {
                tenantId: args.tenantId,
                serviceId: args.serviceId,
                locationId: slot.locationId,
                startAt: slot.startAt,
                endAt: slot.endAt,
                slotStatus: slot.slotStatus,
                visibility: slot.visibility,
                capacity: slot.capacity,
                createdByUserId,
                policySnapshot: slot.policySnapshot,
                locationSnapshot: slot.locationSnapshot,
            });
            insertedIds.push(id);
        }
        return insertedIds;
    },
});

/**
 * テナントの予約枠一覧を取得する。
 * サービス名・場所名を結合して返す。
 */
export const listByTenant = query({
    args: {
        tenantId: v.id("Tenants"),
        limit: v.optional(v.number()),
        from: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 200;
        let slots = await ctx.db
            .query("Slots")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .order("desc")
            .take(limit);

        if (args.from) {
            slots = slots.filter((s) => s.startAt >= args.from!);
        }

        const serviceCache = new Map<string, { title: string; deleted: boolean }>();
        const locationCache = new Map<string, { name: string; deleted: boolean }>();

        const results = [];
        for (const slot of slots) {
            let svcInfo = serviceCache.get(slot.serviceId);
            if (!svcInfo) {
                const svc = await ctx.db.get(slot.serviceId);
                svcInfo = svc
                    ? { title: svc.title, deleted: false }
                    : { title: "不明", deleted: true };
                serviceCache.set(slot.serviceId, svcInfo);
            }
            let locInfo = locationCache.get(slot.locationId);
            if (!locInfo) {
                const loc = await ctx.db.get(slot.locationId);
                locInfo = loc
                    ? { name: loc.name, deleted: false }
                    : { name: "不明", deleted: true };
                locationCache.set(slot.locationId, locInfo);
            }

            let snapshotLocationName: string | undefined;
            try {
                const parsed = JSON.parse(slot.locationSnapshot);
                snapshotLocationName = parsed?.name;
            } catch { /* ignore */ }

            let snapshotServiceName: string | undefined;
            try {
                const parsed = JSON.parse(slot.policySnapshot);
                snapshotServiceName = parsed?.serviceName;
            } catch { /* ignore */ }

            const locationChanged =
                !locInfo.deleted &&
                snapshotLocationName !== undefined &&
                snapshotLocationName !== locInfo.name;

            results.push({
                ...slot,
                serviceName: svcInfo.title,
                serviceDeleted: svcInfo.deleted,
                snapshotServiceName,
                locationName: locInfo.name,
                locationDeleted: locInfo.deleted,
                locationChanged,
                snapshotLocationName,
            });
        }
        return results;
    },
});

/**
 * 顧客向け: テナントの予約可能スロット一覧を取得する。
 * open & public & 未来 & 受付期間内 & 残枠ありのスロットのみ返す。
 */
export const listAvailableByTenant = query({
    args: {
        tenantId: v.id("Tenants"),
        from: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const now = new Date();
        const fromStr = args.from ?? now.toISOString();

        const slots = await ctx.db
            .query("Slots")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .order("asc")
            .collect();

        const serviceCache = new Map<string, string>();
        const locationCache = new Map<string, string>();
        const bookingCountCache = new Map<string, number>();

        const results = [];
        for (const slot of slots) {
            if (slot.slotStatus !== "open") continue;
            if (slot.visibility !== "public") continue;
            if (slot.startAt < fromStr) continue;

            let policy: Record<string, unknown> = {};
            try { policy = JSON.parse(slot.policySnapshot); } catch { /* ignore */ }

            const acceptance = policy.acceptanceWindow as
                | { openBeforeMinutes?: number; closeBeforeMinutes?: number }
                | undefined;
            if (acceptance) {
                const startMs = new Date(slot.startAt).getTime();
                const openMs = startMs - (acceptance.openBeforeMinutes ?? 0) * 60_000;
                const closeMs = startMs - (acceptance.closeBeforeMinutes ?? 0) * 60_000;
                const nowMs = now.getTime();
                if (nowMs < openMs || nowMs > closeMs) continue;
            }

            let confirmedCount = bookingCountCache.get(slot._id);
            if (confirmedCount === undefined) {
                const bookings = await ctx.db
                    .query("Bookings")
                    .withIndex("by_slot_status", (q) =>
                        q.eq("slotId", slot._id as Id<"Slots">).eq("status", "confirmed"),
                    )
                    .collect();
                confirmedCount = bookings.length;
                bookingCountCache.set(slot._id, confirmedCount);
            }

            const remaining = slot.capacity - confirmedCount;
            if (remaining <= 0) continue;

            let serviceName = serviceCache.get(slot.serviceId);
            if (serviceName === undefined) {
                const svc = await ctx.db.get(slot.serviceId);
                serviceName = svc?.title ?? "不明";
                serviceCache.set(slot.serviceId, serviceName);
            }

            let locationName = locationCache.get(slot.locationId);
            if (locationName === undefined) {
                const loc = await ctx.db.get(slot.locationId);
                locationName = loc?.name ?? "不明";
                locationCache.set(slot.locationId, locationName);
            }

            let locationSnapshot: Record<string, unknown> = {};
            try { locationSnapshot = JSON.parse(slot.locationSnapshot); } catch { /* ignore */ }

            results.push({
                _id: slot._id,
                tenantId: slot.tenantId,
                serviceId: slot.serviceId,
                locationId: slot.locationId,
                startAt: slot.startAt,
                endAt: slot.endAt,
                capacity: slot.capacity,
                remaining,
                serviceName,
                locationName,
                locationSnapshot,
            });
        }
        return results;
    },
});

/**
 * 顧客向け: 組織横断で予約可能スロットを検索する。
 * 任意のフィルタ（日付・場所・サービス）を組み合わせ可能。
 */
export const listAvailableByOrg = query({
    args: {
        clerkOrgId: v.string(),
        date: v.optional(v.string()),
        locationId: v.optional(v.id("Locations")),
        serviceId: v.optional(v.id("Services")),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const now = new Date();

        const tenants = await ctx.db
            .query("Tenants")
            .withIndex("by_clerkOrgId", (q) =>
                q.eq("clerkOrgId", args.clerkOrgId),
            )
            .collect();
        const tenantMap = new Map(tenants.map((t) => [t._id, t.tenantName]));

        type SlotDoc = Awaited<ReturnType<typeof ctx.db.get<"Slots">>> & {};
        const rawSlots: SlotDoc[] = [];
        for (const tenant of tenants) {
            const tSlots = await ctx.db
                .query("Slots")
                .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
                .order("asc")
                .collect();
            rawSlots.push(...(tSlots as SlotDoc[]));
        }

        const serviceCache = new Map<string, string>();
        const locationCache = new Map<string, string>();

        const results = [];
        for (const slot of rawSlots) {
            if (slot.slotStatus !== "open") continue;
            if (slot.visibility !== "public") continue;
            if (slot.startAt < now.toISOString()) continue;

            if (args.date) {
                const slotDate = slot.startAt.slice(0, 10);
                if (slotDate !== args.date) continue;
            }
            if (args.locationId && slot.locationId !== args.locationId) continue;
            if (args.serviceId && slot.serviceId !== args.serviceId) continue;

            let policy: Record<string, unknown> = {};
            try { policy = JSON.parse(slot.policySnapshot); } catch { /* ignore */ }

            const acceptance = policy.acceptanceWindow as
                | { openBeforeMinutes?: number; closeBeforeMinutes?: number }
                | undefined;
            if (acceptance) {
                const startMs = new Date(slot.startAt).getTime();
                const openMs = startMs - (acceptance.openBeforeMinutes ?? 0) * 60_000;
                const closeMs = startMs - (acceptance.closeBeforeMinutes ?? 0) * 60_000;
                const nowMs = now.getTime();
                if (nowMs < openMs || nowMs > closeMs) continue;
            }

            const bookings = await ctx.db
                .query("Bookings")
                .withIndex("by_slot_status", (q) =>
                    q.eq("slotId", slot._id as Id<"Slots">).eq("status", "confirmed"),
                )
                .collect();
            const remaining = slot.capacity - bookings.length;
            if (remaining <= 0) continue;

            let serviceName = serviceCache.get(slot.serviceId);
            if (serviceName === undefined) {
                const svc = await ctx.db.get(slot.serviceId);
                serviceName = svc?.title ?? "不明";
                serviceCache.set(slot.serviceId, serviceName);
            }
            let locationName = locationCache.get(slot.locationId);
            if (locationName === undefined) {
                const loc = await ctx.db.get(slot.locationId);
                locationName = loc?.name ?? "不明";
                locationCache.set(slot.locationId, locationName);
            }

            results.push({
                _id: slot._id,
                tenantId: slot.tenantId,
                tenantName: tenantMap.get(slot.tenantId) ?? "不明",
                serviceId: slot.serviceId,
                locationId: slot.locationId,
                startAt: slot.startAt,
                endAt: slot.endAt,
                capacity: slot.capacity,
                remaining,
                serviceName,
                locationName,
            });
        }

        return results;
    },
});
