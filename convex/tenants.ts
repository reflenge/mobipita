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
        const tenants = await ctx.db
            .query("Tenants")
            .withIndex("by_clerkOrgId", (q) =>
                q.eq("clerkOrgId", args.clerkOrgId),
            )
            .order("desc")
            .take(limit);

        return Promise.all(
            tenants.map(async (tenant) => {
                const detail = await ctx.db
                    .query("TenantDetails")
                    .withIndex("by_tenantId", (q) => q.eq("tenantId", tenant._id))
                    .unique();
                return {
                    ...tenant,
                    phoneNumber: detail?.phoneNumber ?? "",
                };
            })
        );
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
        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId))
            .unique();

        return {
            ...tenant,
            phoneNumber: detail?.phoneNumber ?? "",
        };
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
            tenantType: args.tenantType,
            tenantLogoFileId: args.tenantLogoFileId,
            tenantStatus: args.tenantStatus,
            storeType: args.storeType,
        });
        await ctx.db.insert("TenantDetails", {
            tenantId: tenantId,
            phoneNumber: args.phoneNumber,
        });
        return tenantId;
    },
});

export const update = mutation({
    args: {
        id: v.id("Tenants"),
        clerkOrgId: v.string(),
        tenantName: v.string(),
        tenantSlug: v.string(),
        phoneNumber: v.optional(v.string()), // 追加
        tenantType: tenantType,
        tenantStatus: tenantStatus,
        storeType: storeType,
        tenantLogoFileId: v.optional(v.id("Files")),
    },
    handler: async (ctx, args) => {
        await requireClerkIdentity(ctx);
        
        const tenant = await ctx.db.get(args.id);
        if (!tenant || tenant.clerkOrgId !== args.clerkOrgId) {
            throw new Error("権限がないか、テナントが存在しません");
        }

        // 指定した ID のデータを更新
        await ctx.db.patch(args.id, {
            tenantName: args.tenantName,
            tenantSlug: args.tenantSlug,
            tenantType: args.tenantType,
            tenantStatus: args.tenantStatus,
            storeType: args.storeType,
            tenantLogoFileId: args.tenantLogoFileId,
        });
        // 詳細テーブルの更新
        const detail = await ctx.db
            .query("TenantDetails")
            .withIndex("by_tenantId", (q) => q.eq("tenantId", args.id))
            .unique();

        if (detail) {
            await ctx.db.patch(detail._id, { phoneNumber: args.phoneNumber });
        } else {
            await ctx.db.insert("TenantDetails", {
                tenantId: args.id,
                phoneNumber: args.phoneNumber,
            });
        }

        return args.id;
    },
});
// --- 既存データ移行用（一度だけ実行したら消してOK） ---
export const migrateDetails = mutation({
    args: {},
    handler: async (ctx) => {
        // 全てのテナントを取得
        const allTenants = await ctx.db.query("Tenants").collect();
        
        let count = 0;
        for (const tenant of allTenants) {
            // すでに詳細テーブルがあるか確認
            const existing = await ctx.db
                .query("TenantDetails")
                .withIndex("by_tenantId", (q) => q.eq("tenantId", tenant._id))
                .unique();
            
            if (!existing) {
                // 詳細テーブルが存在しない場合のみ作成
                // ※ (tenant as any).phoneNumber は、スキーマから消した古いデータにアクセスするための書き方です
                await ctx.db.insert("TenantDetails", {
                    tenantId: tenant._id,
                    phoneNumber: (tenant as any).phoneNumber ?? "",
                });
                count++;
            }
        }
        return `完了！ ${count} 件のデータを移行しました。`;
    },
});
// --- 古いフィールドの掃除用（一度だけ実行） ---
export const clearOldFields = mutation({
  args: {},
  handler: async (ctx) => {
    const allTenants = await ctx.db.query("Tenants").collect();
    for (const tenant of allTenants) {
      // 修正：phoneNumber フィールドを undefined に設定して patch することで削除する
      await ctx.db.patch(tenant._id, {
        ["phoneNumber" as any]: undefined,
      });
    }
    return "Tenants テーブルから古い phoneNumber フィールドを全て削除しました。";
  },
});