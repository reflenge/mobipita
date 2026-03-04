import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/** tenantName の重複をチェックし、重複があれば ConvexError を投げる */
export async function assertUniqueTenantName(
    ctx: QueryCtx | MutationCtx,
    tenantName: string,
    excludeTenantId?: Id<"Tenants">,
) {
    const existing = await ctx.db
        .query("Tenants")
        .withIndex("by_tenantName", (q) => q.eq("tenantName", tenantName))
        .first();

    if (existing && existing._id !== excludeTenantId) {
        throw new ConvexError(
            "同じテナント名が既に存在します。",
        );
    }
}

/**
 * Tenant ドキュメントに TenantDetails（電話番号・メール・住所）と logoUrl を結合して返す。
 * list / getById / adminListAll で同じ結合ロジックが重複していたため共通化。
 */
export async function enrichTenant(
    ctx: QueryCtx,
    tenant: Doc<"Tenants">,
) {
    const detail = await ctx.db
        .query("TenantDetails")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", tenant._id))
        .unique();

    let logoUrl = null;
    if (tenant.tenantLogoFileId) {
        const fileDoc = await ctx.db.get(tenant.tenantLogoFileId);
        if (fileDoc) {
            logoUrl = await ctx.storage.getUrl(fileDoc.storageId);
        }
    }

    return {
        ...tenant,
        phoneNumber: detail?.phoneNumber ?? "",
        email: detail?.email ?? "",
        address: detail?.address ?? "",
        logoUrl,
    };
}
