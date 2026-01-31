import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// メッセージの公開範囲（全体 / 組織）を定義する。
const messageScope = v.union(v.literal("global"), v.literal("organization"));
// ファイルの状態（仮置き / 本紐付け）を定義する。
const fileStatus = v.union(v.literal("temporary"), v.literal("attached"));
// テナントの種別（直営 / テナント）を定義する。
const tenantType = v.union(v.literal("direct"), v.literal("tenant"));
// テナントの運用状態を定義する。
const tenantStatus = v.union(
    v.literal("preparing"),
    v.literal("open"),
    v.literal("paused"),
    v.literal("closed"),
);

export default defineSchema({
    // チャットメッセージの保存テーブル。
    Messages: defineTable({
        // 本文。
        text: v.string(),
        // 送信者の Clerk userId。
        userId: v.string(),
        // スコープ（全体 / 組織）。
        scope: messageScope,
        // 組織スコープの場合のみ入る orgId。
        orgId: v.optional(v.string()),
    })
        // スコープ単体で検索するためのインデックス。
        .index("by_scope", ["scope"])
        // 組織スコープかつ orgId で検索するための複合インデックス。
        .index("by_scope_orgId", ["scope", "orgId"]),
    // アップロード済みファイルのメタデータ。
    Files: defineTable({
        // Convex のストレージ ID。
        storageId: v.id("_storage"),
        // 元のファイル名。
        fileName: v.string(),
        // MIME タイプ。
        contentType: v.string(),
        // ファイルサイズ（bytes）。
        size: v.number(),
        // ファイルの状態。
        status: fileStatus,
    })
        // storageId での直接検索用。
        .index("by_storageId", ["storageId"])
        // 状態での絞り込み用。
        .index("by_status", ["status"])
        // MIME タイプでの絞り込み用。
        .index("by_contentType", ["contentType"]),
    // テナント情報。
    Tenants: defineTable({
        // Clerk の組織 ID。
        clerkOrgId: v.string(),
        // 作成者の Clerk userId（既存データ互換のため任意）。
        createdByUserId: v.string(),
        // テナント名。
        tenantName: v.string(),
        // URL に使うスラッグ。
        tenantSlug: v.string(),
        // テナント種別。
        tenantType: tenantType,
        // ロゴ画像の Files レコード ID（任意）。
        tenantLogoFileId: v.optional(v.id("Files")),
        // 運用状態。
        tenantStatus: tenantStatus,
    })
        // テナントスラッグで検索するためのインデックス。
        .index("by_org_slug", ["tenantSlug"])
        // 組織 ID で検索するためのインデックス。
        .index("by_clerkOrgId", ["clerkOrgId"])
        // 組織内でスラッグの重複チェック用。
        .index("by_clerkOrgId_tenantSlug", ["clerkOrgId", "tenantSlug"])
        // ステータスでの絞り込み用。
        .index("by_status", ["tenantStatus"])
        // 種別での絞り込み用。
        .index("by_type", ["tenantType"])
        // ステータス + 種別の複合検索用。
        .index("by_status_type", ["tenantStatus", "tenantType"]),
    // テナントへの従業員（Member）割当。1 Member が複数テナントに割り当て可能。
    TenantMemberAssignments: defineTable({
        // Clerk の組織 ID（スコープ用）。
        clerkOrgId: v.string(),
        // 割当先テナント（Convex Tenants の ID）。
        tenantId: v.id("Tenants"),
        // 割当るメンバーの Clerk userId。
        clerkUserId: v.string(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_org_user", ["clerkOrgId", "clerkUserId"])
        .index("by_org", ["clerkOrgId"])
        // 同一テナント・同一ユーザーの重複を防ぐ。
        .index("by_tenant_user", ["tenantId", "clerkUserId"]),
});
