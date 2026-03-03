"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ImageIcon,
    Phone,
    Search,
    SearchX,
} from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
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

const PAGE_SIZE = 6;

const TenantList = () => {
    const tenants = useQuery(api.tenants.list, { limit: 50 });

    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [storeTypeFilter, setStoreTypeFilter] = React.useState("all");
    const [page, setPage] = React.useState(1);

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
            const matchesStoreType =
                storeTypeFilter === "all" ||
                tenant.storeType === storeTypeFilter;
            return (
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesStoreType
            );
        });
    }, [tenants, searchQuery, statusFilter, typeFilter, storeTypeFilter]);

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
            <div className="space-y-6">
                <Skeleton className="h-24 w-full rounded-xl" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card
                        key={`skeleton-${i}`}
                        className="rounded-xl p-5"
                    >
                        <div className="flex flex-col md:flex-row gap-5">
                            <Skeleton className="w-24 h-24 shrink-0 rounded-lg" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-8 w-full mt-3" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── フィルタバー ── */}
            <Card className="rounded-xl p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">
                            キーワード検索
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                                placeholder="テナントを検索..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className="pl-9 h-10 text-sm rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 items-end">
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                ステータス
                            </label>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="h-10 text-sm rounded-lg">
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
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                種別
                            </label>
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="h-10 text-sm rounded-lg">
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
                        <div className="min-w-[140px]">
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                営業形態
                            </label>
                            <Select
                                value={storeTypeFilter}
                                onValueChange={setStoreTypeFilter}
                            >
                                <SelectTrigger className="h-10 text-sm rounded-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        すべて
                                    </SelectItem>
                                    {Object.entries(
                                        storeTypeLabels,
                                    ).map(([value, label]) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ── 件数表示 ── */}
            {filteredTenants && filteredTenants.length > 0 && (
                <p className="text-sm font-medium text-gray-600">
                    全{" "}
                    <span className="font-bold text-base text-gray-900">
                        {filteredTenants.length}
                    </span>{" "}
                    件のテナント
                </p>
            )}

            {/* ── 空状態 ── */}
            {filteredTenants && filteredTenants.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                    <SearchX className="size-12 mb-3" />
                    <p className="text-base font-bold">
                        該当するテナントはありません
                    </p>
                    <p className="mt-1.5 text-sm">
                        検索条件を変更してお試しください。
                    </p>
                </div>
            )}

            {/* ── カード一覧 ── */}
            <div className="grid grid-cols-1 gap-4">
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
                        <Link
                            key={tenant._id}
                            href={`/m/company/tenant/${tenant._id}`}
                            className="block"
                        >
                            <Card className="rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-5">
                                    {/* ロゴ */}
                                    <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 relative">
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <ImageIcon className="size-8" />
                                            <span className="text-[10px] mt-0.5">
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
                                    <div className="flex-1 min-w-0">
                                        {/* テナント名 */}
                                        <h2 className="text-lg md:text-xl font-bold line-clamp-1 mb-2">
                                            {tenant.tenantName}
                                        </h2>

                                        {/* バッジ（1行に並べる） */}
                                        <div className="flex items-center gap-2 flex-nowrap">
                                            <span
                                                className={`inline-flex items-center shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusStyle[tenant.tenantStatus] ?? ""}`}
                                            >
                                                {status}
                                            </span>
                                            <span
                                                className={`inline-flex items-center shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${typeStyle[tenant.tenantType] ?? ""}`}
                                            >
                                                {type}
                                            </span>
                                            {tenant.storeType && (
                                                <span
                                                    className={`inline-flex items-center shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${storeTypeStyle[tenant.storeType] ?? ""}`}
                                                >
                                                    {storeType}
                                                </span>
                                            )}
                                        </div>

                                        {/* メタ情報 */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-gray-500 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-4" />
                                                <span>
                                                    作成日:{" "}
                                                    {createdAt}
                                                </span>
                                            </div>
                                            {tenant.phoneNumber && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="size-4" />
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
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* ── ページネーション ── */}
            {filteredTenants && filteredTenants.length > PAGE_SIZE && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                    <div className="text-sm text-gray-500">
                        {total}件中 {rangeStart}-{rangeEnd}
                        件を表示
                    </div>
                    <nav className="flex items-center gap-1.5">
                        <button
                            className="p-2 rounded-md border border-gray-300 hover:bg-white disabled:opacity-50"
                            onClick={() =>
                                setPage((p) => Math.max(1, p - 1))
                            }
                            disabled={page === 1}
                            aria-label="前のページ"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        {Array.from({ length: totalPages }).map(
                            (_, i) => {
                                const idx = i + 1;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setPage(idx)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-md font-semibold text-sm ${
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
                            className="p-2 rounded-md border border-gray-300 hover:bg-white disabled:opacity-50"
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(totalPages, p + 1),
                                )
                            }
                            disabled={page === totalPages}
                            aria-label="次のページ"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default TenantList;
