import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";
import { tenantType, tenantStatus, storeType } from "./values";

// 組織単位でテナント一覧を取得する。
export const listByOrg = query({
    args: {
        clerkOrgId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 認証必須。
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 50;
        return ctx.db
            .query("Tenants")
            .withIndex("by_clerkOrgId", (q) =>
                q.eq("clerkOrgId", args.clerkOrgId),
            )
            .order("desc")
            .take(limit);
    },
});

// 組織スコープ内のテナントを取得する。
export const getByIdInOrg = query({
    args: {
        clerkOrgId: v.string(),
        tenantId: v.id("Tenants"),
    },
    handler: async (ctx, args) => {
        // 認証必須。
        await requireClerkIdentity(ctx);
        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            return null;
        }
        return tenant;
    },
});

export const create = mutation({
    args: {
        clerkOrgId: v.string(),
        tenantName: v.string(),
        tenantSlug: v.string(),
        phoneNumber: v.optional(v.string()),
        tenantType: tenantType,
        tenantLogoFileId: v.optional(v.id("Files")),
        tenantStatus: tenantStatus,
        storeType: storeType,
    },
    handler: async (ctx, args) => {
        const createdByUserId = await requireClerkUserId(ctx);

        // 同一組織内でスラッグの重複を禁止する。
        const existing = await ctx.db
            .query("Tenants")
            .withIndex("by_clerkOrgId_tenantSlug", (q) =>
                q
                    .eq("clerkOrgId", args.clerkOrgId)
                    .eq("tenantSlug", args.tenantSlug),
            )
            .first();
        if (existing) {
            throw new ConvexError({
                id: "TENANT_SLUG_DUPLICATE",
                message:
                    "このスラッグは既に使用されています。「リセット」で新しいスラッグを採番してください。",
            });
        }

        const tenantId = await ctx.db.insert("Tenants", {
            clerkOrgId: args.clerkOrgId,
            createdByUserId: createdByUserId,
            tenantName: args.tenantName,
            tenantSlug: args.tenantSlug,
            phoneNumber: args.phoneNumber,
            tenantType: args.tenantType,
            tenantLogoFileId: args.tenantLogoFileId,
            tenantStatus: args.tenantStatus,
            storeType: args.storeType,
        });

        return tenantId;
    },
});
