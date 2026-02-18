import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";

/**
 * テナントに紐づくサービス一覧を取得する。
 */
export const listByTenant = query({
    args: {
        tenantId: v.id("Tenants"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const limit = typeof args.limit === "number" ? args.limit : 50;
        return ctx.db
            .query("Services")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .order("desc")
            .take(limit);
    },
});

/**
 * 組織スコープ内でサービスを1件取得する（詳細表示用）。
 */
export const getByIdInOrg = query({
    args: {
        clerkOrgId: v.string(),
        serviceId: v.id("Services"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const service = await ctx.db.get(args.serviceId);
        if (!service) return null;
        const tenant = await ctx.db.get(service.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            return null;
        }
        return service;
    },
});

/**
 * テナントにサービスを1件作成する。
 * 組織スコープ内のテナントであることを検証してから挿入する。
 */
export const create = mutation({
    args: {
        clerkOrgId: v.string(),
        tenantId: v.id("Tenants"),
        title: v.string(),
        description: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const createdByUserId = await requireClerkUserId(ctx);

        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("テナントが見つからないか、この組織に属していません。");
        }

        const serviceId = await ctx.db.insert("Services", {
            tenantId: args.tenantId,
            createdByUserId,
            title: args.title,
            description: args.description,
            isActive: args.isActive,
        });

        return serviceId;
    },
});

/**
 * 組織スコープ内のサービスを1件更新する。
 */
export const update = mutation({
    args: {
        clerkOrgId: v.string(),
        serviceId: v.id("Services"),
        title: v.string(),
        description: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const service = await ctx.db.get(args.serviceId);
        if (!service) {
            throw new Error("サービスが見つかりません");
        }
        const tenant = await ctx.db.get(service.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("この組織のサービスではありません");
        }

        await ctx.db.patch(args.serviceId, {
            title: args.title,
            description: args.description,
            isActive: args.isActive,
        });

        return args.serviceId;
    },
});

/**
 * 組織スコープ内のサービスを1件削除する。
 */
export const remove = mutation({
    args: {
        clerkOrgId: v.string(),
        serviceId: v.id("Services"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const service = await ctx.db.get(args.serviceId);
        if (!service) {
            throw new Error("サービスが見つかりません");
        }
        const tenant = await ctx.db.get(service.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("この組織のサービスではありません");
        }

        await ctx.db.delete(args.serviceId);
        return args.serviceId;
    },
});
