import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";
import { slotStatus, slotVisibility } from "./values";

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
