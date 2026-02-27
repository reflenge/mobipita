import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireClerkIdentity } from "./lib/clerkAuth";
import { storeType } from "./values";
import type { Id } from "./_generated/dataModel";

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
 * 全テナントの場所を横断取得する（場所から探す用）。
 */
export const listAll = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 500;
        const tenants = await ctx.db.query("Tenants").order("desc").take(limit);
        const results: Array<{
            _id: Id<"Locations">;
            tenantId: Id<"Tenants">;
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

export const getById = query({
    args: {
        locationId: v.id("Locations"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        return await ctx.db.get(args.locationId);
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

export const update = mutation({
    args: {
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

export const remove = mutation({
    args: {
        locationId: v.id("Locations"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const location = await ctx.db.get(args.locationId);
        if (!location) {
            throw new Error("場所が見つかりません");
        }

        await ctx.db.delete(args.locationId);
        return args.locationId;
    },
});
