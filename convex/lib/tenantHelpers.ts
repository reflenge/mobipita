import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Tenant ドキュメントに TenantDetails（電話番号等）と logoUrl を結合して返す。
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
        logoUrl,
    };
}
