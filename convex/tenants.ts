import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
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
        tenantSlug: v.string(),
        tenantType: tenantType,
        tenantLogoFileId: v.optional(v.id("Files")),
        tenantStatus: tenantStatus,
        storeType: storeType,
    },
    handler: async (ctx, args) => {
        const createdByUserId = await requireClerkUserId(ctx);

        const existing = await ctx.db
            .query("Tenants")
            .withIndex("by_slug", (q) => q.eq("tenantSlug", args.tenantSlug))
            .first();
        if (existing) {
            throw new ConvexError({
                id: "TENANT_SLUG_DUPLICATE",
                message:
                    "このスラッグは既に使用されています。「リセット」で新しいスラッグを採番してください。",
            });
        }

        const tenantId = await ctx.db.insert("Tenants", {
            createdByUserId,
            tenantName: args.tenantName,
            tenantSlug: args.tenantSlug,
            tenantType: args.tenantType,
            tenantLogoFileId: args.tenantLogoFileId,
            tenantStatus: args.tenantStatus,
            storeType: args.storeType,
        });

        return tenantId;
    },
});
