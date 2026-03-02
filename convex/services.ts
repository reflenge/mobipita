import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";
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
            .query("Services")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .order("desc")
            .take(limit);
    },
});

/**
 * 全テナントの有効サービス一覧を取得する（サービスから探す用）。
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        await requireClerkIdentity(ctx);
        const tenants = await ctx.db.query("Tenants").collect();

        const results: Array<{
            _id: Id<"Services">;
            tenantId: Id<"Tenants">;
            tenantName: string;
            title: string;
            description: string;
            isActive: boolean;
        }> = [];
        for (const tenant of tenants) {
            const services = await ctx.db
                .query("Services")
                .withIndex("by_tenant_active", (q) =>
                    q.eq("tenantId", tenant._id).eq("isActive", true),
                )
                .collect();
            for (const svc of services) {
                results.push({
                    _id: svc._id,
                    tenantId: svc.tenantId,
                    tenantName: tenant.tenantName,
                    title: svc.title,
                    description: svc.description,
                    isActive: svc.isActive,
                });
            }
        }
        return results;
    },
});

export const getById = query({
    args: {
        serviceId: v.id("Services"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        return await ctx.db.get(args.serviceId);
    },
});

export const create = mutation({
    args: {
        tenantId: v.id("Tenants"),
        title: v.string(),
        description: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const createdByUserId = await requireClerkUserId(ctx);

        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant) {
            throw new Error("テナントが見つかりません。");
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

export const update = mutation({
    args: {
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

        await ctx.db.patch(args.serviceId, {
            title: args.title,
            description: args.description,
            isActive: args.isActive,
        });

        return args.serviceId;
    },
});

export const remove = mutation({
    args: {
        serviceId: v.id("Services"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);

        const service = await ctx.db.get(args.serviceId);
        if (!service) {
            throw new Error("サービスが見つかりません");
        }

        await ctx.db.delete(args.serviceId);
        return args.serviceId;
    },
});
