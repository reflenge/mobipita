// list / getById / adminListAll で同じ TenantDetails 結合 + logoUrl 取得が
// 3箇所に重複していたため、読み取り専用ヘルパーとして切り出した
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

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
