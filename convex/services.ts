import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireClerkUserId } from "./lib/clerkAuth";

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
