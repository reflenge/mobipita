import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
    messageScope,
    fileStatus,
    tenantType,
    tenantStatus,
    storeType,
    slotStatus,
    slotVisibility,
} from "./values";

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
        // 作成者の Clerk userId。
        createdByUserId: v.string(),
        // テナント名。
        tenantName: v.string(),
        // URL に使うスラッグ。
        // NOTE: 今のところ使っていない 使う予定もあまりない
        tenantSlug: v.string(),
        // テナント種別。
        tenantType: tenantType,
        // ロゴ画像の Files レコード ID（任意）。
        tenantLogoFileId: v.optional(v.id("Files")),
        // 運用状態。
        tenantStatus: tenantStatus,
        // 店舗形態（移動店舗 / 固定店舗）。
        storeType: storeType,
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
    // テナントの場所（店舗・拠点）。
    Locations: defineTable({
        // 所属テナント。
        tenantId: v.id("Tenants"),
        // 種別（固定店舗 / 移動店舗）。
        type: storeType,
        // 場所名。
        name: v.string(),
        // 住所（地図クリックによる自動取得、編集不可）。
        autoAddress: v.string(),
        // 住所（ユーザー手入力の正式住所）。
        semiAddress: v.string(),
        // 緯度。
        lat: v.number(),
        // 経度。
        lng: v.number(),
        // 詳細・備考。
        details: v.string(),
    })
        .index("by_tenant", ["tenantId"]),
    // 予約枠。日時ごとに1レコード。テンプレ内容は policySnapshot（JSON 文字列）に固定。
    Slots: defineTable({
        // 所属テナント。
        tenantId: v.id("Tenants"),
        // 紐づくサービス。
        serviceId: v.id("Services"),
        // 紐づく場所。
        locationId: v.id("Locations"),
        // 枠の開始日時（ISO 8601）。
        startAt: v.string(),
        // 枠の終了日時（ISO 8601）。
        endAt: v.string(),
        // 受付状態。
        slotStatus: slotStatus,
        // 公開範囲。
        visibility: slotVisibility,
        // 同時予約可能数。
        capacity: v.number(),
        // 作成者の Clerk userId。
        createdByUserId: v.string(),
        // テンプレ全項目のスナップショット（JSON.stringify）。
        // スキーマを緻密に定義せず柔軟に保持する。
        policySnapshot: v.string(),
        // 場所のスナップショット（JSON.stringify）。
        locationSnapshot: v.string(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_tenant_service", ["tenantId", "serviceId"])
        .index("by_tenant_startAt", ["tenantId", "startAt"]),
    // テナントが提供するサービス。
    Services: defineTable({
        // 所属テナント。
        tenantId: v.id("Tenants"),
        // 作成者の Clerk userId。
        createdByUserId: v.string(),
        // サービス名。
        title: v.string(),
        // 説明（HTML 可）。
        description: v.string(),
        // 有効/無効。
        isActive: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_tenant_active", ["tenantId", "isActive"]),
});
