import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";

/**
 * 予約フォーム用: スロット詳細 + 残り枠数 + フォーム質問を取得する。
 */
export const getSlotForBooking = query({
    args: { slotId: v.id("Slots") },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const slot = await ctx.db.get(args.slotId);
        if (!slot) throw new ConvexError("スロットが見つかりません");

        const confirmedBookings = await ctx.db
            .query("Bookings")
            .withIndex("by_slot_status", (q) =>
                q.eq("slotId", args.slotId).eq("status", "confirmed"),
            )
            .collect();
        const remaining = slot.capacity - confirmedBookings.length;

        const service = await ctx.db.get(slot.serviceId);
        const location = await ctx.db.get(slot.locationId);

        let policy: Record<string, unknown> = {};
        try { policy = JSON.parse(slot.policySnapshot); } catch { /* ignore */ }

        let locationSnapshot: Record<string, unknown> = {};
        try { locationSnapshot = JSON.parse(slot.locationSnapshot); } catch { /* ignore */ }

        const form = policy.form as { questions?: Array<{ id: string; label: string; type: string; required: boolean }> } | undefined;

        return {
            _id: slot._id,
            tenantId: slot.tenantId,
            startAt: slot.startAt,
            endAt: slot.endAt,
            capacity: slot.capacity,
            remaining,
            slotStatus: slot.slotStatus,
            visibility: slot.visibility,
            serviceName: service?.title ?? "不明",
            serviceDescription: service?.description ?? "",
            locationName: location?.name ?? "不明",
            locationSnapshot,
            questions: form?.questions ?? [],
            cancellationPolicy: policy.cancellationPolicy as Record<string, unknown> | undefined,
        };
    },
});

/**
 * 予約を作成する。即時確定（status: confirmed）。
 */
export const create = mutation({
    args: {
        slotId: v.id("Slots"),
        answers: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireClerkUserId(ctx);

        const slot = await ctx.db.get(args.slotId);
        if (!slot) throw new ConvexError("スロットが見つかりません");
        if (slot.slotStatus !== "open") throw new ConvexError("この枠は現在受付していません");
        if (slot.visibility === "private") throw new ConvexError("この枠は非公開です");

        let policy: Record<string, unknown> = {};
        try { policy = JSON.parse(slot.policySnapshot); } catch { /* ignore */ }

        const now = new Date();
        const startMs = new Date(slot.startAt).getTime();
        const acceptance = policy.acceptanceWindow as
            | { openBeforeMinutes?: number; closeBeforeMinutes?: number }
            | undefined;
        if (acceptance) {
            const openMs = startMs - (acceptance.openBeforeMinutes ?? 0) * 60_000;
            const closeMs = startMs - (acceptance.closeBeforeMinutes ?? 0) * 60_000;
            const nowMs = now.getTime();
            if (nowMs < openMs) throw new ConvexError("受付期間前です");
            if (nowMs > closeMs) throw new ConvexError("受付は締め切りました");
        }

        const confirmedBookings = await ctx.db
            .query("Bookings")
            .withIndex("by_slot_status", (q) =>
                q.eq("slotId", args.slotId).eq("status", "confirmed"),
            )
            .collect();

        if (confirmedBookings.length >= slot.capacity) {
            throw new ConvexError("この枠は満員です");
        }

        const existingBooking = confirmedBookings.find(
            (b) => b.clerkUserId === userId,
        );
        if (existingBooking) {
            throw new ConvexError("この枠は既に予約済みです");
        }

        const dailyLimit = Number(policy.dailyBookingLimit) || 0;
        if (dailyLimit > 0) {
            const slotDate = slot.startAt.slice(0, 10);
            const allSlots = await ctx.db
                .query("Slots")
                .withIndex("by_tenant_service", (q) =>
                    q.eq("tenantId", slot.tenantId).eq("serviceId", slot.serviceId),
                )
                .collect();
            const sameDaySlotIds = allSlots
                .filter((s) => s.startAt.slice(0, 10) === slotDate)
                .map((s) => s._id);

            let dailyCount = 0;
            for (const sid of sameDaySlotIds) {
                const bookings = await ctx.db
                    .query("Bookings")
                    .withIndex("by_slot_status", (q) =>
                        q.eq("slotId", sid).eq("status", "confirmed"),
                    )
                    .collect();
                dailyCount += bookings.filter((b) => b.clerkUserId === userId).length;
            }
            if (dailyCount >= dailyLimit) {
                throw new ConvexError(`1日の予約上限（${dailyLimit}件）に達しています`);
            }
        }

        const cancellationPolicy = policy.cancellationPolicy ?? {};
        const bookingPolicySnapshot = JSON.stringify({ cancellationPolicy });

        const bookingId = await ctx.db.insert("Bookings", {
            tenantId: slot.tenantId,
            slotId: args.slotId,
            status: "confirmed",
            clerkUserId: userId,
            answers: args.answers,
            policySnapshot: bookingPolicySnapshot,
        });

        return bookingId;
    },
});

/**
 * 顧客が自分の予約をキャンセルする。
 */
export const cancel = mutation({
    args: { bookingId: v.id("Bookings") },
    handler: async (ctx, args) => {
        const userId = await requireClerkUserId(ctx);

        const booking = await ctx.db.get(args.bookingId);
        if (!booking) throw new ConvexError("予約が見つかりません");
        if (booking.clerkUserId !== userId) throw new ConvexError("この予約をキャンセルする権限がありません");
        if (booking.status !== "confirmed") throw new ConvexError("この予約はキャンセルできません");

        let bookingPolicy: Record<string, unknown> = {};
        try { bookingPolicy = JSON.parse(booking.policySnapshot); } catch { /* ignore */ }

        const cancellation = bookingPolicy.cancellationPolicy as
            | { allowCustomerCancel?: boolean; cancelDeadlineMinutes?: number }
            | undefined;

        if (cancellation && !cancellation.allowCustomerCancel) {
            throw new ConvexError("顧客によるキャンセルは許可されていません");
        }

        const slot = await ctx.db.get(booking.slotId);
        if (slot && cancellation?.cancelDeadlineMinutes) {
            const startMs = new Date(slot.startAt).getTime();
            const deadlineMs = startMs - cancellation.cancelDeadlineMinutes * 60_000;
            if (Date.now() > deadlineMs) {
                throw new ConvexError("キャンセル期限を過ぎています");
            }
        }

        await ctx.db.patch(args.bookingId, { status: "canceled" });
    },
});

/**
 * 顧客の予約一覧を取得する。スロット・サービス・場所情報を結合して返す。
 */
export const listMyBookings = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireClerkUserId(ctx);

        const bookings = await ctx.db
            .query("Bookings")
            .withIndex("by_user", (q) => q.eq("clerkUserId", userId))
            .order("desc")
            .take(100);

        const slotCache = new Map<string, Awaited<ReturnType<typeof ctx.db.get<"Slots">>>>();
        const serviceCache = new Map<string, string>();
        const locationCache = new Map<string, string>();

        const results = [];
        for (const booking of bookings) {
            let slot = slotCache.get(booking.slotId);
            if (slot === undefined) {
                slot = await ctx.db.get(booking.slotId);
                slotCache.set(booking.slotId, slot);
            }

            let serviceName = "不明";
            let locationName = "不明";
            let startAt = "";
            let endAt = "";
            let locationSnapshot: Record<string, unknown> = {};

            if (slot) {
                startAt = slot.startAt;
                endAt = slot.endAt;

                const cachedSvc = serviceCache.get(slot.serviceId);
                if (cachedSvc !== undefined) {
                    serviceName = cachedSvc;
                } else {
                    const svc = await ctx.db.get(slot.serviceId);
                    serviceName = svc?.title ?? "不明";
                    serviceCache.set(slot.serviceId, serviceName);
                }

                const cachedLoc = locationCache.get(slot.locationId);
                if (cachedLoc !== undefined) {
                    locationName = cachedLoc;
                } else {
                    const loc = await ctx.db.get(slot.locationId);
                    locationName = loc?.name ?? "不明";
                    locationCache.set(slot.locationId, locationName);
                }

                try { locationSnapshot = JSON.parse(slot.locationSnapshot); } catch { /* ignore */ }
            }

            let bookingPolicy: Record<string, unknown> = {};
            try { bookingPolicy = JSON.parse(booking.policySnapshot); } catch { /* ignore */ }

            const cancellation = bookingPolicy.cancellationPolicy as
                | { allowCustomerCancel?: boolean; cancelDeadlineMinutes?: number }
                | undefined;

            let canCancel = false;
            if (booking.status === "confirmed" && cancellation?.allowCustomerCancel && slot) {
                const startMs = new Date(slot.startAt).getTime();
                const deadlineMs = startMs - (cancellation.cancelDeadlineMinutes ?? 0) * 60_000;
                canCancel = Date.now() <= deadlineMs;
            }

            results.push({
                _id: booking._id,
                _creationTime: booking._creationTime,
                slotId: booking.slotId,
                status: booking.status,
                startAt,
                endAt,
                serviceName,
                locationName,
                locationSnapshot,
                canCancel,
            });
        }

        return results;
    },
});
