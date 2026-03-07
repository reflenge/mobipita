"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    Phone,
    RefreshCw,
    Search,
    SearchX,
    Trash2,
} from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { DeleteTenantDialog } from "./DeleteTenantDialog";
import { StatusChangeDialog } from "./StatusChangeDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Id } from "@/../convex/_generated/dataModel";

const statusLabels: Record<string, string> = {
    preparing: "準備中",
    open: "公開中",
    paused: "一時停止",
    closed: "終了",
};

const typeLabels: Record<string, string> = {
    direct: "直営",
    tenant: "テナント",
};

const storeTypeLabels: Record<string, string> = {
    mobile: "移動店舗",
    fixed: "固定店舗",
};

const statusStyle: Record<string, string> = {
    preparing: "bg-yellow-100 text-yellow-700 border-yellow-200",
    open: "bg-green-100 text-green-700 border-green-200",
    paused: "bg-gray-100 text-gray-600 border-gray-200",
    closed: "bg-red-100 text-red-700 border-red-200",
};

const typeStyle: Record<string, string> = {
    direct: "bg-orange-100 text-orange-700 border-orange-200",
    tenant: "bg-slate-100 text-slate-600 border-slate-200",
};

const storeTypeStyle: Record<string, string> = {
    mobile: "bg-blue-100 text-blue-700 border-blue-200",
    fixed: "bg-slate-100 text-slate-600 border-slate-200",
};

type TenantItem = NonNullable<
    ReturnType<typeof useQuery<typeof api.tenants.adminListAll>>
>[number];

const PAGE_SIZE = 6;

/**
 * admin ロール専用テナント一覧。
 * company 版と異なり、ステータス変更・削除のアクションボタンを各カードに表示する。
 * 削除はカスケード（関連する予約・スロット等も全て削除）。
 */
const AdminTenantList = () => {
    const tenants = useQuery(api.tenants.adminListAll, { limit: 200 });

    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [page, setPage] = React.useState(1);

    // ダイアログ用ステート
    const [statusTarget, setStatusTarget] =
        React.useState<TenantItem | null>(null);
    const [deleteTarget, setDeleteTarget] =
        React.useState<TenantItem | null>(null);

    const filteredTenants = React.useMemo(() => {
        if (!tenants) return null;
        return tenants.filter((tenant) => {
            const matchesSearch = tenant.tenantName
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesStatus =
                statusFilter === "all" ||
                tenant.tenantStatus === statusFilter;
            const matchesType =
                typeFilter === "all" ||
                tenant.tenantType === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [tenants, searchQuery, statusFilter, typeFilter]);

    const total = filteredTenants?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    React.useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    const displayedTenants = React.useMemo(() => {
        if (!filteredTenants) return null;
        const start = (page - 1) * PAGE_SIZE;
        return filteredTenants.slice(start, start + PAGE_SIZE);
    }, [filteredTenants, page]);

    const rangeStart = (page - 1) * PAGE_SIZE + 1;
    const rangeEnd = Math.min(page * PAGE_SIZE, total);

    // ── ローディング ──
    if (!tenants) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-32 w-full rounded-xl" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card
                        key={`skeleton-${i}`}
                        className="rounded-xl p-6"
                    >
                        <div className="flex flex-col md:flex-row gap-6">
                            <Skeleton className="w-36 h-36 shrink-0 rounded-xl" />
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-8 w-1/3" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-12 w-full mt-4" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── フィルタバー ── */}
            <Card className="rounded-xl p-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-base font-medium mb-2 text-gray-700">
                            キーワード検索
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <Input
                                placeholder="テナントを検索..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className="pl-10 h-12 text-base rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-auto min-w-[180px]">
                        <label className="block text-base font-medium mb-2 text-gray-700">
                            ステータス
                        </label>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="h-12 text-base rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    すべて
                                </SelectItem>
                                {Object.entries(statusLabels).map(
                                    ([value, label]) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full md:w-auto min-w-[180px]">
                        <label className="block text-base font-medium mb-2 text-gray-700">
                            種別
                        </label>
                        <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                        >
                            <SelectTrigger className="h-12 text-base rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    すべて
                                </SelectItem>
                                {Object.entries(typeLabels).map(
                                    ([value, label]) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* ── 件数表示 ── */}
            {filteredTenants && filteredTenants.length > 0 && (
                <p className="text-lg font-medium text-gray-700">
                    全{" "}
                    <span className="font-bold text-xl text-gray-900">
                        {filteredTenants.length}
                    </span>{" "}
                    件のテナント
                </p>
            )}

            {/* ── 空状態 ── */}
            {filteredTenants && filteredTenants.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                    <SearchX className="size-16 mb-4" />
                    <p className="text-xl font-bold">
                        該当するテナントはありません
                    </p>
                    <p className="mt-2 text-lg">
                        検索条件を変更してお試しください。
                    </p>
                </div>
            )}

            {/* ── カード一覧 ── */}
            <div className="grid grid-cols-1 gap-6">
                {displayedTenants?.map((tenant) => {
                    const status =
                        statusLabels[tenant.tenantStatus] ?? "不明";
                    const type =
                        typeLabels[tenant.tenantType] ?? "不明";
                    const storeType =
                        storeTypeLabels[tenant.storeType] ??
                        tenant.storeType;
                    const createdAt = new Date(
                        tenant._creationTime,
                    ).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    });

                    return (
                        <Card
                            key={tenant._id}
                            className="rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* ロゴ */}
                                <div className="w-36 h-36 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 relative">
                                    <div className="text-gray-400 flex flex-col items-center">
                                        <ImageIcon className="size-10" />
                                        <span className="text-xs mt-1">
                                            NO IMAGE
                                        </span>
                                    </div>
                                    {tenant.logoUrl && (
                                        <img
                                            src={tenant.logoUrl}
                                            alt={tenant.tenantName}
                                            loading="eager"
                                            crossOrigin="anonymous"
                                            decoding="async"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display =
                                                    "none";
                                            }}
                                        />
                                    )}
                                </div>

                                {/* 情報エリア */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        {/* テナント名 + バッジ */}
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h2 className="text-2xl md:text-3xl font-bold line-clamp-1">
                                                {tenant.tenantName}
                                            </h2>
                                            <span
                                                className={`inline-flex items-center px-4 py-1.5 text-base font-bold rounded-full border ${statusStyle[tenant.tenantStatus] ?? ""}`}
                                            >
                                                {status}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-4 py-1.5 text-base font-bold rounded-full border ${typeStyle[tenant.tenantType] ?? ""}`}
                                            >
                                                {type}
                                            </span>
                                            {tenant.storeType && (
                                                <span
                                                    className={`inline-flex items-center px-4 py-1.5 text-base font-bold rounded-full border ${storeTypeStyle[tenant.storeType] ?? ""}`}
                                                >
                                                    {storeType}
                                                </span>
                                            )}
                                        </div>

                                        {/* メタ情報 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-4 text-gray-600 text-lg">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-5" />
                                                <span>
                                                    作成日:{" "}
                                                    {createdAt}
                                                </span>
                                            </div>
                                            {tenant.phoneNumber && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="size-5" />
                                                    <span>
                                                        連絡先:{" "}
                                                        {
                                                            tenant.phoneNumber
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* アクションボタン */}
                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-5 py-3 border-2 border-gray-200 rounded-lg text-lg font-bold hover:bg-gray-50 transition-colors"
                                            onClick={() =>
                                                setStatusTarget(tenant)
                                            }
                                        >
                                            <RefreshCw className="size-5" />
                                            ステータス変更
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-5 py-3 border-2 border-red-200 text-red-600 rounded-lg text-lg font-bold hover:bg-red-50 hover:text-red-700 transition-colors"
                                            onClick={() =>
                                                setDeleteTarget(tenant)
                                            }
                                        >
                                            <Trash2 className="size-5" />
                                            削除する
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* ── ページネーション ── */}
            {filteredTenants && filteredTenants.length > PAGE_SIZE && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <div className="text-lg text-gray-600">
                        {total}件中 {rangeStart}-{rangeEnd}
                        件を表示
                    </div>
                    <nav className="flex items-center gap-2">
                        <button
                            className="p-3 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50"
                            onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                            disabled={page === 1}
                            aria-label="前のページ"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        {Array.from({ length: totalPages }).map(
                            (_, i) => {
                                const idx = i + 1;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setPage(idx)}
                                        className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-lg ${
                                            idx === page
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-300 hover:bg-white"
                                        }`}
                                    >
                                        {idx}
                                    </button>
                                );
                            },
                        )}
                        <button
                            className="p-3 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50"
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(totalPages, p + 1),
                                )
                            }
                            disabled={page === totalPages}
                            aria-label="次のページ"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                    </nav>
                </div>
            )}

            {/* ── ダイアログ ── */}
            {statusTarget && (
                <StatusChangeDialog
                    open={!!statusTarget}
                    onOpenChange={(open) => {
                        if (!open) setStatusTarget(null);
                    }}
                    tenantId={statusTarget._id}
                    tenantName={statusTarget.tenantName}
                    currentStatus={statusTarget.tenantStatus}
                />
            )}
            {deleteTarget && (
                <DeleteTenantDialog
                    open={!!deleteTarget}
                    onOpenChange={(open) => {
                        if (!open) setDeleteTarget(null);
                    }}
                    tenantId={deleteTarget._id}
                    tenantName={deleteTarget.tenantName}
                />
            )}
        </div>
    );
};

export default AdminTenantList;
