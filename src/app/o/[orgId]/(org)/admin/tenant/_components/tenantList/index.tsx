"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Eye, Trash2, Search, ImageIcon } from "lucide-react";

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

const storeTypeVariant: Record<string, "default" | "secondary" | "outline"> = {
    mobile: "outline",
    fixed: "secondary",
};

const statusVariant: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    preparing: "outline",
    open: "default",
    paused: "secondary",
    closed: "destructive",
};

type TenantListProps = {
    orgId: string;
};

const TenantList = ({ orgId }: TenantListProps) => {
    const [searchQuery, setSearchQuery] = React.useState("");
    const tenants = useQuery(api.tenants.listByOrg, {
        clerkOrgId: orgId,
        limit: 50,
    });

    React.useEffect(() => {
        // デバッグ: サーバーから取得した tenants データと logoUrl を確認
        if (tenants) {
            try {
                // eslint-disable-next-line no-console
                console.debug("TenantList: tenants fetched", tenants.map(t => ({ id: t._id, name: t.tenantName, logoUrl: t.logoUrl })));
            } catch (e) {
                // eslint-disable-next-line no-console
                console.debug("TenantList: tenants fetched", tenants);
            }
        }
    }, [tenants]);

    const [page, setPage] = React.useState(1);
    const pageSize = 6;

    const filteredTenants = React.useMemo(() => {
        if (!tenants) return null;
        return tenants.filter(
            (tenant) =>
                tenant.tenantName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                tenant.tenantSlug
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
        );
    }, [tenants, searchQuery]);

    const total = filteredTenants?.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    React.useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    const displayedTenants = React.useMemo(() => {
        if (!filteredTenants) return null;
        const start = (page - 1) * pageSize;
        return filteredTenants.slice(start, start + pageSize);
    }, [filteredTenants, page]);

    if (!tenants) {
        return (
            <div className="space-y-4">
                {/* 検索バースケルトン */}
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                </div>
                {/* カードスケルトン */}
                <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={`tenant-skeleton-${index}`} className="border border-gray-200">
                            <CardHeader className="pb-4">
                                <div className="flex items-start gap-4">
                                    <Skeleton className="h-16 w-16 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (filteredTenants?.length === 0) {
        return (
            <div className="space-y-4">
                {/* 検索バー */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="テナントを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                    <CardHeader className="text-center py-12">
                        <CardTitle className="text-gray-700">テナントはまだありません</CardTitle>
                        <CardDescription className="mt-2">
                            最初のテナントを作成して、組織の運用を始めましょう。
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 検索バー */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="テナントを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base"
                />
            </div>

            {/* テナント一覧 */}
            <div className="grid gap-6 grid-cols-1">
                {displayedTenants?.map((tenant) => {
                    const status = statusLabels[tenant.tenantStatus] ?? "不明";
                    const type = typeLabels[tenant.tenantType] ?? "不明";
                    const createdAt = new Date(
                        tenant._creationTime,
                    ).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    });

                    return (
                        <Card key={tenant._id} className="rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all bg-white overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex items-stretch gap-6 p-6">
                                    {/* ロゴエリア（左） */}
                                    <div className="flex-shrink-0">
                                        <div className="w-36 h-36 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                                            {tenant.logoUrl ? (
                                                <>
                                                    <img
                                                        src={tenant.logoUrl}
                                                        alt={tenant.tenantName}
                                                        loading="eager"
                                                        crossOrigin="anonymous"
                                                        decoding="async"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const img = e.currentTarget as HTMLImageElement;
                                                            img.style.display = "none";
                                                            const fallback = img.parentElement?.querySelector('.logo-fallback') as HTMLElement | null;
                                                            if (fallback) fallback.classList.remove('hidden');
                                                        }}
                                                        onLoad={(e) => {
                                                            const img = e.currentTarget as HTMLImageElement;
                                                            const fallback = img.parentElement?.querySelector('.logo-fallback') as HTMLElement | null;
                                                            if (fallback) fallback.classList.add('hidden');
                                                            img.style.display = '';
                                                        }}
                                                    />
                                                    <div className="logo-fallback hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                                                        <ImageIcon className="w-14 h-14 text-gray-400" />
                                                    </div>
                                                </>
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* 右側エリア（情報＋アクション） */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        {/* 上部：テナント名＋バッジ＋設定ボタン */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-1">
                                                        {tenant.tenantName}
                                                    </h3>
                                                    <p className="text-sm md:text-base text-gray-600">
                                                        /{tenant.tenantSlug}
                                                    </p>
                                                </div>
                                                {/* 設定ボタン（右上） */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="flex-shrink-0 h-8 w-8"
                                                >
                                                    <span className="text-lg">⋯</span>
                                                </Button>
                                            </div>

                                            {/* バッジ行：営業状況、形態等を集約 */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant={
                                                        statusVariant[tenant.tenantStatus] ?? "outline"
                                                    }
                                                    className="whitespace-nowrap font-semibold px-2 py-1 text-xs md:text-sm rounded-full"
                                                >
                                                    {status}
                                                </Badge>
                                                <Badge variant="secondary" className="font-medium text-xs md:text-sm">
                                                    {type}
                                                </Badge>
                                                {tenant.storeType && (
                                                    <Badge variant={storeTypeVariant[tenant.storeType] ?? 'outline'} className="font-medium text-xs md:text-sm">
                                                        {storeTypeLabels[tenant.storeType] ?? tenant.storeType}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* 下部：メタ情報＋アクションボタン */}
                                        <div>
                                            {/* メタ情報行 */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 mb-3">
                                                <span>作成日: {createdAt}</span>
                                                {tenant.phoneNumber && (
                                                    <>
                                                        <span>•</span>
                                                        <span>連絡先: {tenant.phoneNumber}</span>
                                                    </>
                                                )}
                                                {/* DEBUG: logoUrl を表示（クリックで新しいタブ） */}
                                                {tenant.logoUrl && (
                                                    <a
                                                        href={tenant.logoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 underline truncate max-w-xs"
                                                        aria-label={`Open logo for ${tenant.tenantName}`}
                                                    >
                                                        logo
                                                    </a>
                                                )}
                                            </div>

                                            {/* アクションボタン */}
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="font-semibold rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                                >
                                                    <Link href={`/o/${orgId}/admin/tenant/${tenant._id}`} className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>詳細</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="font-semibold rounded-md hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                                                >
                                                    <Link href={`/o/${orgId}/admin/tenant/${tenant._id}/edit`} className="flex items-center gap-1">
                                                        <Edit2 className="w-4 h-4" />
                                                        <span>編集</span>
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="font-semibold text-red-700 rounded-md hover:bg-red-50 hover:text-red-900 hover:border-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* 合計件数表示 */}
            {filteredTenants && filteredTenants.length > 0 && (
                    <div className="mt-6">
                    <div className="text-base text-gray-600 mb-3">全 <span className="font-bold text-gray-900">{filteredTenants.length}</span> 件のテナント</div>
                    {/* ページネーション */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            className="px-4 py-2 rounded-md border text-sm md:text-base"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const idx = i + 1;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setPage(idx)}
                                    className={`px-4 py-2 rounded-md text-sm md:text-base ${idx === page ? 'bg-blue-600 text-white' : 'border'}`}
                                >
                                    {idx}
                                </button>
                            );
                        })}
                        <button
                            className="px-4 py-2 rounded-md border text-sm md:text-base"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantList;
