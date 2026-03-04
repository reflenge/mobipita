/**
 * テナント関連の表示ラベル・バッジスタイル定義。
 * company / admin 両方の画面で共有するため、UI 側の定義を一箇所に集約。
 */
export type TenantStatus = "preparing" | "open" | "paused" | "closed";
export type TenantType = "direct" | "tenant";
export type StoreType = "mobile" | "fixed";

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
    preparing: "準備中",
    open: "公開中",
    paused: "一時停止",
    closed: "終了",
};

export const TENANT_TYPE_LABELS: Record<TenantType, string> = {
    direct: "直営",
    tenant: "テナント",
};

export const STORE_TYPE_LABELS: Record<StoreType, string> = {
    mobile: "移動店舗",
    fixed: "固定店舗",
};

export const TENANT_STATUS_STYLE: Record<TenantStatus, string> = {
    preparing: "bg-yellow-100 text-yellow-700 border-yellow-200",
    open: "bg-green-100 text-green-700 border-green-200",
    paused: "bg-gray-100 text-gray-600 border-gray-200",
    closed: "bg-red-100 text-red-700 border-red-200",
};

export const TENANT_TYPE_STYLE: Record<TenantType, string> = {
    direct: "bg-orange-100 text-orange-700 border-orange-200",
    tenant: "bg-slate-100 text-slate-600 border-slate-200",
};

export const STORE_TYPE_STYLE: Record<StoreType, string> = {
    mobile: "bg-blue-100 text-blue-700 border-blue-200",
    fixed: "bg-slate-100 text-slate-600 border-slate-200",
};
