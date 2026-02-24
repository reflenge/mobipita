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
 * 組織に所属する全 locations を取得する（テナント経由）。
 * 店舗検索で「近い順」に並べるためにクライアントで距離計算する想定。
 */
export const listLocationsByOrg = query({
    args: {
        clerkOrgId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 500;
        const tenants = await ctx.db
            .query("Tenants")
            .withIndex("by_clerkOrgId", (q) =>
                q.eq("clerkOrgId", args.clerkOrgId),
            )
            .order("desc")
            .take(limit);
        const results: Array<{
            _id: import("./_generated/dataModel").Id<"Locations">;
            tenantId: import("./_generated/dataModel").Id<"Tenants">;
            tenantName: string;
            type: "fixed" | "mobile";
            name: string;
            autoAddress: string;
            semiAddress: string;
            lat: number;
            lng: number;
            details: string;
        }> = [];
        for (const tenant of tenants) {
            const locations = await ctx.db
                .query("Locations")
                .withIndex("by_tenant", (q) => q.eq("tenantId", tenant._id))
                .order("desc")
                .take(200);
            for (const loc of locations) {
                results.push({
                    _id: loc._id,
                    tenantId: loc.tenantId,
                    tenantName: tenant.tenantName,
                    type: loc.type,
                    name: loc.name,
                    autoAddress: loc.autoAddress,
                    semiAddress: loc.semiAddress,
                    lat: loc.lat,
                    lng: loc.lng,
                    details: loc.details,
                });
            }
        }
        return results;
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
        autoAddress: v.string(),
        semiAddress: v.string(),
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
            autoAddress: args.autoAddress,
            semiAddress: args.semiAddress,
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
        autoAddress: v.string(),
        semiAddress: v.string(),
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
            autoAddress: args.autoAddress,
            semiAddress: args.semiAddress,
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
