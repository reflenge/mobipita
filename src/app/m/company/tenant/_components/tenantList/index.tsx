"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Phone,
    Search,
    SearchX,
} from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    STORE_TYPE_LABELS,
    STORE_TYPE_STYLE,
    TENANT_STATUS_LABELS,
    TENANT_STATUS_STYLE,
    TENANT_TYPE_LABELS,
    TENANT_TYPE_STYLE,
    getTenantDisplayLabels,
} from "@/lib/tenant";
import TenantLogo from "../TenantLogo";

const PAGE_SIZE = 6;

/**
 * company ロール向けテナント一覧。
 * キーワード・ステータス・種別・営業形態でフィルタリングし、
 * カード形式でページネーション表示する。
 */
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
                <Skeleton className="h-28 w-full rounded-xl" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={`skeleton-${i}`}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <div className="flex flex-col md:flex-row gap-5">
                            <Skeleton className="w-20 h-20 shrink-0 rounded-xl" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-7 w-1/3" />
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-2/3 mt-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── フィルタバー ── */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <Search className="size-5 text-orange-500" />
                    <h2 className="text-lg font-semibold">
                        検索・絞り込み
                    </h2>
                </div>
                <div className="flex flex-wrap gap-3 items-end p-5">
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-sm font-medium mb-1.5 text-slate-500">
                            キーワード検索
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input
                                placeholder="テナント名で検索..."
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
                            <label className="block text-sm font-medium mb-1.5 text-slate-500">
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
                                    {Object.entries(TENANT_STATUS_LABELS).map(
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
                            <label className="block text-sm font-medium mb-1.5 text-slate-500">
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
                                    {Object.entries(TENANT_TYPE_LABELS).map(
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
                            <label className="block text-sm font-medium mb-1.5 text-slate-500">
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
                                        STORE_TYPE_LABELS,
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
            </section>

            {/* ── 件数表示 ── */}
            {filteredTenants && filteredTenants.length > 0 && (
                <p className="text-base font-medium text-slate-600">
                    全{" "}
                    <span className="text-lg font-bold text-slate-900">
                        {filteredTenants.length}
                    </span>{" "}
                    件のテナント
                </p>
            )}

            {/* ── 空状態 ── */}
            {filteredTenants && filteredTenants.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-10 text-slate-500">
                    <SearchX className="mb-3 size-12" />
                    <p className="text-lg font-bold">
                        該当するテナントはありません
                    </p>
                    <p className="mt-1.5 text-base">
                        検索条件を変更してお試しください。
                    </p>
                </div>
            )}

            {/* ── カード一覧 ── */}
            <div className="grid grid-cols-1 gap-4">
                {displayedTenants?.map((tenant) => {
                    const { status, type, storeType } =
                        getTenantDisplayLabels(tenant);
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
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                                <div className="flex flex-col md:flex-row gap-5">
                                    {/* ロゴ */}
                                    <TenantLogo
                                        logoUrl={tenant.logoUrl}
                                        tenantName={tenant.tenantName}
                                        showLabel
                                    />

                                    {/* 情報エリア */}
                                    <div className="flex-1 min-w-0">
                                        {/* テナント名 + 詳細リンク案内 */}
                                        <div className="flex items-start justify-between gap-2">
                                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 line-clamp-1 mb-2">
                                                {tenant.tenantName}
                                            </h2>
                                            <span className="hidden shrink-0 items-center gap-0.5 text-sm text-slate-400 md:flex">
                                                詳細を見る
                                                <ChevronRight className="size-4" />
                                            </span>
                                        </div>

                                        {/* バッジ（1行に並べる） */}
                                        <div className="flex items-center gap-2 flex-nowrap">
                                            <Badge
                                                className={TENANT_STATUS_STYLE[tenant.tenantStatus] ?? ""}
                                            >
                                                {status}
                                            </Badge>
                                            <Badge
                                                className={TENANT_TYPE_STYLE[tenant.tenantType] ?? ""}
                                            >
                                                {type}
                                            </Badge>
                                            {tenant.storeType && (
                                                <Badge
                                                    className={STORE_TYPE_STYLE[tenant.storeType] ?? ""}
                                                >
                                                    {storeType}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* メタ情報 */}
                                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-base text-slate-500">
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
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* ── ページネーション ── */}
            {filteredTenants && filteredTenants.length > PAGE_SIZE && (
                <div className="mt-2 flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <div className="text-base text-slate-500">
                        {total}件中 {rangeStart}-{rangeEnd}
                        件を表示
                    </div>
                    <nav className="flex items-center gap-1.5">
                        <button
                            className="rounded-lg border border-slate-300 p-2 hover:bg-white disabled:opacity-50"
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
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                                            idx === page
                                                ? "bg-orange-500 text-white"
                                                : "border border-slate-300 hover:bg-white"
                                        }`}
                                    >
                                        {idx}
                                    </button>
                                );
                            },
                        )}
                        <button
                            className="rounded-lg border border-slate-300 p-2 hover:bg-white disabled:opacity-50"
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
