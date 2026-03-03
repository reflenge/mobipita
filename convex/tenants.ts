import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
    requireClerkIdentity,
    requireClerkUserId,
    requireMinRole,
} from "./lib/clerkAuth";
import { tenantType, tenantStatus, storeType } from "./values";

export const list = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 50;
        const tenants = await ctx.db
            .query("Tenants")
            .order("desc")
            .take(limit);

        return Promise.all(
            tenants.map(async (tenant) => {
                const detail = await ctx.db
                    .query("TenantDetails")
                    .withIndex("by_tenantId", (q) =>
                        q.eq("tenantId", tenant._id),
                    )
                    .unique();
                let logoUrl = null;
                if (tenant.tenantLogoFileId) {
                    const fileDoc = await ctx.db.get(tenant.tenantLogoFileId);
                    if (fileDoc) {
                        logoUrl = await ctx.storage.getUrl(fileDoc.storageId);
                    }
                }
                return {
                    ...tenant,
                    phoneNumber: detail?.phoneNumber ?? "",
                    logoUrl,
                };
            }),
        );
    },
});

export const getById = query({
    args: {
        tenantId: v.id("Tenants"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) return null;

        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .unique();

        let logoUrl = null;
        if (tenant.tenantLogoFileId) {
            const fileDoc = await ctx.db.get(tenant.tenantLogoFileId);
            if (fileDoc) {
                logoUrl = await ctx.storage.getUrl(fileDoc.storageId);
            }
        }
        return {
            ...tenant,
            phoneNumber: detail?.phoneNumber ?? "",
            logoUrl,
        };
    },
});

export const create = mutation({
    args: {
        tenantName: v.string(),
        phoneNumber: v.optional(v.string()),
        tenantType: tenantType,
        tenantLogoFileId: v.optional(v.id("Files")),
        tenantStatus: tenantStatus,
        storeType: storeType,
    },
    handler: async (ctx, args) => {
        const createdByUserId = await requireClerkUserId(ctx);

        const tenantId = await ctx.db.insert("Tenants", {
            createdByUserId,
            tenantName: args.tenantName,
            tenantType: args.tenantType,
            tenantLogoFileId: args.tenantLogoFileId,
            tenantStatus: args.tenantStatus,
            storeType: args.storeType,
        });
        await ctx.db.insert("TenantDetails", {
            tenantId: tenantId,
            phoneNumber: args.phoneNumber,
        });
        return tenantId;
    },
});

export const update = mutation({
    args: {
        id: v.id("Tenants"),
        tenantName: v.string(),
        phoneNumber: v.optional(v.string()),
        tenantType: tenantType,
        tenantStatus: tenantStatus,
        storeType: storeType,
        tenantLogoFileId: v.optional(v.id("Files")),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        await ctx.db.patch(args.id, {
            tenantName: args.tenantName,
            tenantType: args.tenantType,
            tenantStatus: args.tenantStatus,
            storeType: args.storeType,
            tenantLogoFileId: args.tenantLogoFileId,
        });
        // 詳細テーブルの更新
        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", args.id))
            .unique();

        if (detail) {
            await ctx.db.patch(detail._id, { phoneNumber: args.phoneNumber });
        } else {
            await ctx.db.insert("TenantDetails", {
                tenantId: args.id,
                phoneNumber: args.phoneNumber,
            });
        }

        return args.id;
    },
});

export const remove = mutation({
    args: {
        tenantId: v.id("Tenants"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new Error("テナントが存在しません");
        }

        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
            .unique();

        if (detail) {
            await ctx.db.delete(detail._id);
        }

        await ctx.db.delete(args.tenantId);
    },
});

export const updateDetail = mutation({
    args: {
        tenantId: v.id("Tenants"),
        phoneNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new Error("テナントが存在しません");
        }

        // 詳細テーブルの更新
        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
            .unique();

        if (detail) {
            await ctx.db.patch(detail._id, { phoneNumber: args.phoneNumber });
        } else {
            await ctx.db.insert("TenantDetails", {
                tenantId: args.tenantId,
                phoneNumber: args.phoneNumber,
            });
        }

        return args.tenantId;
    },
});

// ── Admin 専用 ─────────────────────────────

export const adminListAll = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireMinRole(ctx, "admin");
        const limit = typeof args.limit === "number" ? args.limit : 200;
        const tenants = await ctx.db
            .query("Tenants")
            .order("desc")
            .take(limit);

        return Promise.all(
            tenants.map(async (tenant) => {
                const detail = await ctx.db
                    .query("TenantDetails")
                    .withIndex("by_tenantId", (q) =>
                        q.eq("tenantId", tenant._id),
                    )
                    .unique();
                let logoUrl = null;
                if (tenant.tenantLogoFileId) {
                    const fileDoc = await ctx.db.get(
                        tenant.tenantLogoFileId,
                    );
                    if (fileDoc) {
                        logoUrl = await ctx.storage.getUrl(
                            fileDoc.storageId,
                        );
                    }
                }
                return {
                    ...tenant,
                    phoneNumber: detail?.phoneNumber ?? "",
                    logoUrl,
                };
            }),
        );
    },
});

export const adminUpdateStatus = mutation({
    args: {
        tenantId: v.id("Tenants"),
        tenantStatus: tenantStatus,
    },
    handler: async (ctx, args) => {
        await requireMinRole(ctx, "admin");
        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new ConvexError("テナントが存在しません。");
        }
        await ctx.db.patch(args.tenantId, {
            tenantStatus: args.tenantStatus,
        });
        return args.tenantId;
    },
});

export const adminRemove = mutation({
    args: {
        tenantId: v.id("Tenants"),
    },
    handler: async (ctx, args) => {
        await requireMinRole(ctx, "admin");
        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new ConvexError("テナントが存在しません。");
        }

        // カスケード削除: 関連データを全て削除
        // 1. Bookings（テナント単位）
        const bookings = await ctx.db
            .query("Bookings")
            .withIndex("by_tenant", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .collect();
        for (const booking of bookings) {
            await ctx.db.delete(booking._id);
        }

        // 2. Slots
        const slots = await ctx.db
            .query("Slots")
            .withIndex("by_tenant", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .collect();
        for (const slot of slots) {
            await ctx.db.delete(slot._id);
        }

        // 3. Services
        const services = await ctx.db
            .query("Services")
            .withIndex("by_tenant", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .collect();
        for (const service of services) {
            await ctx.db.delete(service._id);
        }

        // 4. Locations
        const locations = await ctx.db
            .query("Locations")
            .withIndex("by_tenant", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .collect();
        for (const location of locations) {
            await ctx.db.delete(location._id);
        }

        // 5. TenantMemberAssignments
        const assignments = await ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_tenant", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .collect();
        for (const assignment of assignments) {
            await ctx.db.delete(assignment._id);
        }

        // 6. TenantDetails
        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) =>
                q.eq("tenantId", args.tenantId),
            )
            .unique();
        if (detail) {
            await ctx.db.delete(detail._id);
        }

        // 7. テナント本体
        await ctx.db.delete(args.tenantId);

        return args.tenantId;
    },
});