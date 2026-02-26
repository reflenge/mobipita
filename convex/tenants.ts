import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";
import { tenantType, tenantStatus, storeType } from "./values";

export const list = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 50;
        return ctx.db.query("Tenants").order("desc").take(limit);
    },
});

export const getById = query({
    args: {
        tenantId: v.id("Tenants"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        return await ctx.db.get(args.tenantId);
    },
});

export const create = mutation({
    args: {
        tenantName: v.string(),
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

        return tenantId;
    },
});
