import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkIdentity, requireClerkUserId } from "./lib/clerkAuth";

/**
 * 組織内の全割当を取得する（従業員振り分け画面用）。
 */
export const listByOrg = query({
    args: {
        clerkOrgId: v.string(),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        return ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_org", (q) => q.eq("clerkOrgId", args.clerkOrgId))
            .collect();
    },
});

/**
 * 指定テナントに割り当てられているメンバー（clerkUserId 一覧）を取得する。
 */
export const listByTenant = query({
    args: {
        clerkOrgId: v.string(),
        tenantId: v.id("Tenants"),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const list = await ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
            .collect();
        return list
            .filter((a) => a.clerkOrgId === args.clerkOrgId)
            .map((a) => a.clerkUserId);
    },
});

/**
 * 指定メンバーが割り当てられているテナント ID 一覧を取得する。
 */
export const listByMember = query({
    args: {
        clerkOrgId: v.string(),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        const list = await ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_org_user", (q) =>
                q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId),
            )
            .collect();
        return list.map((a) => a.tenantId);
    },
});

/**
 * 1 件割り当てる（既に同じ組み合わせがあれば何もしない）。
 */
export const assign = mutation({
    args: {
        clerkOrgId: v.string(),
        tenantId: v.id("Tenants"),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        await requireClerkUserId(ctx);
        const tenant = await ctx.db.get(args.tenantId);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("テナントが組織に属していません");
        }
        const existing = await ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_tenant_user", (q) =>
                q.eq("tenantId", args.tenantId).eq("clerkUserId", args.clerkUserId),
            )
            .first();
        if (existing) {
            return existing._id;
        }
        return await ctx.db.insert("TenantMemberAssignments", {
            clerkOrgId: args.clerkOrgId,
            tenantId: args.tenantId,
            clerkUserId: args.clerkUserId,
        });
    },
});

/**
 * 1 件割り当てを解除する。
 */
export const unassign = mutation({
    args: {
        clerkOrgId: v.string(),
        tenantId: v.id("Tenants"),
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        await requireClerkUserId(ctx);
        const assignment = await ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_tenant_user", (q) =>
                q.eq("tenantId", args.tenantId).eq("clerkUserId", args.clerkUserId),
            )
            .first();
        if (assignment && assignment.clerkOrgId === args.clerkOrgId) {
            await ctx.db.delete(assignment._id);
        }
    },
});

/**
 * 指定メンバーの割当を、指定テナント ID 一覧だけに揃える（追加・削除を一括反映）。
 */
export const setAssignmentsForMember = mutation({
    args: {
        clerkOrgId: v.string(),
        clerkUserId: v.string(),
        tenantIds: v.array(v.id("Tenants")),
    },
    handler: async (ctx, args) => {
        await requireClerkUserId(ctx);
        const current = await ctx.db
            .query("TenantMemberAssignments")
            .withIndex("by_org_user", (q) =>
                q.eq("clerkOrgId", args.clerkOrgId).eq("clerkUserId", args.clerkUserId),
            )
            .collect();

        const currentTenantIds = new Set(current.map((c) => c.tenantId));
        const targetTenantIds = new Set(args.tenantIds);

        for (const row of current) {
            if (!targetTenantIds.has(row.tenantId)) {
                await ctx.db.delete(row._id);
            }
        }

        for (const tenantId of targetTenantIds) {
            if (currentTenantIds.has(tenantId)) continue;
            const tenant = await ctx.db.get(tenantId);
            if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) continue;
            await ctx.db.insert("TenantMemberAssignments", {
                clerkOrgId: args.clerkOrgId,
                tenantId,
                clerkUserId: args.clerkUserId,
            });
        }
    },
});
