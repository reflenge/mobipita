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
import { ChevronRight, Edit2, Eye } from "lucide-react";

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
    const tenants = useQuery(api.tenants.listByOrg, {
        clerkOrgId: orgId,
        limit: 50,
    });

    if (!tenants) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={`tenant-skeleton-${index}`} className="border border-gray-200 hover:border-gray-300 transition-colors">
                        <CardHeader className="gap-3">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-28" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="h-4 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (tenants.length === 0) {
        return (
            <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                <CardHeader className="text-center py-12">
                    <CardTitle className="text-gray-700">テナントはまだありません</CardTitle>
                    <CardDescription className="mt-2">
                        最初のテナントを作成して、組織の運用を始めましょう。
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* テナント一覧グリッド */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenants.map((tenant) => {
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
                        <Link
                            key={tenant._id}
                            href={`/o/${orgId}/admin/tenant/${tenant._id}`}
                            className="group"
                        >
                            <Card className="h-full border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-white">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {tenant.tenantName}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-gray-600 mt-1">
                                                /{tenant.tenantSlug}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={
                                                statusVariant[tenant.tenantStatus] ?? "outline"
                                            }
                                            className="whitespace-nowrap text-xs font-semibold px-2.5 py-1"
                                        >
                                            {status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pb-4">
                                    {/* 種別情報 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-600">種別</span>
                                        <Badge variant="secondary" className="text-xs px-2 py-1">
                                            {type}
                                        </Badge>
                                    </div>

                                    {/* 電話番号（存在する場合） */}
                                    {tenant.phoneNumber && (
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-xs font-medium text-gray-600">連絡先</span>
                                            <span className="text-xs text-gray-900 font-semibold text-right break-all">
                                                {tenant.phoneNumber}
                                            </span>
                                        </div>
                                    )}

                                    {/* 作成日 */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-600">作成日</span>
                                        <span className="text-xs text-gray-700">{createdAt}</span>
                                    </div>

                                    {/* アクションボタン */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>詳細</span>
                                            </div>
                                        </Button>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="flex-1 text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                                        >
                                            <Link href={`/o/${orgId}/admin/tenant/${tenant._id}/edit`} className="flex items-center justify-center gap-1">
                                                <Edit2 className="w-3.5 h-3.5" />
                                                <span>編集</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* テナント合計数 */}
            <div className="text-center text-sm text-gray-600 py-4 border-t border-gray-200">
                全 <span className="font-bold text-gray-900">{tenants.length}</span> 件のテナント
            </div>
        </div>
    );
};

export default TenantList;
