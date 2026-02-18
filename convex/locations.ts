import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkIdentity } from "./lib/clerkAuth";
import { storeType } from "./values";

export const listByTenant = query({
    args: {
        tenantId: v.id("Tenants"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 50;
        return ctx.db
            .query("Locations")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .order("desc")
            .take(limit);
    },
});

/**
 * 組織スコープ内で場所を1件取得する（詳細表示用）。
 */
export const getByIdInOrg = query({
    args: {
        clerkOrgId: v.string(),
        locationId: v.id("Locations"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const location = await ctx.db.get(args.locationId);
        if (!location) return null;
        const tenant = await ctx.db.get(location.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            return null;
        }
        return location;
    },
});

export const create = mutation({
    args: {
        tenantId: v.id("Tenants"),
        type: storeType,
        name: v.string(),
        address: v.string(),
        lat: v.number(),
        lng: v.number(),
        details: v.string(),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new Error("テナントが見つかりません");
        }

        return await ctx.db.insert("Locations", {
            tenantId: args.tenantId,
            type: args.type,
            name: args.name,
            address: args.address,
            lat: args.lat,
            lng: args.lng,
            details: args.details,
        });
    },
});

/**
 * 組織スコープ内の場所を1件更新する。
 */
export const update = mutation({
    args: {
        clerkOrgId: v.string(),
        locationId: v.id("Locations"),
        type: storeType,
        name: v.string(),
        address: v.string(),
        lat: v.number(),
        lng: v.number(),
        details: v.string(),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const location = await ctx.db.get(args.locationId);
        if (!location) {
            throw new Error("場所が見つかりません");
        }
        const tenant = await ctx.db.get(location.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("この組織の場所ではありません");
        }

        await ctx.db.patch(args.locationId, {
            type: args.type,
            name: args.name,
            address: args.address,
            lat: args.lat,
            lng: args.lng,
            details: args.details,
        });

        return args.locationId;
    },
});

/**
 * 組織スコープ内の場所を1件削除する。
 */
export const remove = mutation({
    args: {
        clerkOrgId: v.string(),
        locationId: v.id("Locations"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const location = await ctx.db.get(args.locationId);
        if (!location) {
            throw new Error("場所が見つかりません");
        }
        const tenant = await ctx.db.get(location.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("この組織の場所ではありません");
        }

        await ctx.db.delete(args.locationId);
        return args.locationId;
    },
});
