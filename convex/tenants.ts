import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getClerkIdentity } from "./lib/clerkAuth";

const tenantType = v.union(v.literal("direct"), v.literal("tenant"));
const tenantStatus = v.union(
    v.literal("preparing"),
    v.literal("open"),
    v.literal("paused"),
    v.literal("closed"),
);

export const create = mutation({
    args: {
        clerkOrgId: v.string(),
        tenantName: v.string(),
        tenantSlug: v.string(),
        tenantType: tenantType,
        tenantLogoFileId: v.optional(v.id("Files")),
        tenantStatus: tenantStatus,
    },
    handler: async (ctx, args) => {
        // 作成者を認証情報から取得する。
        const identity = await getClerkIdentity(ctx);
        if (!identity) {
            throw new ConvexError("認証が必要です。");
        }
        const tenantId = await ctx.db.insert("Tenants", {
            clerkOrgId: args.clerkOrgId,
            createdByUserId: identity.subject,
            tenantName: args.tenantName,
            tenantSlug: args.tenantSlug,
            tenantType: args.tenantType,
            tenantLogoFileId: args.tenantLogoFileId,
            tenantStatus: args.tenantStatus,
        });

        return tenantId;
    },
});
