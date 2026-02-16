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
