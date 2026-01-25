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
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`tenant-skeleton-${index}`}>
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
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>テナントはまだありません</CardTitle>
                    <CardDescription>
                        最初のテナントを作成して、組織の運用を始めましょう。
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
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
                        <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
                            <CardHeader className="gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="text-lg">
                                        {tenant.tenantName}
                                    </CardTitle>
                                    <Badge
                                        variant={
                                            statusVariant[tenant.tenantStatus] ??
                                            "outline"
                                        }
                                    >
                                        {status}
                                    </Badge>
                                </div>
                                <CardDescription className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">{type}</Badge>
                                    <span className="text-xs text-muted-foreground">
                                        /{tenant.tenantSlug}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>作成日</span>
                                    <span className="text-foreground">
                                        {createdAt}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>作成者</span>
                                    <span className="text-foreground">
                                        {tenant.createdByUserId ?? "不明"}
                                    </span>
                                </div>
                                {tenant.tenantLogoFileId && (
                                    <div className="flex items-center justify-between">
                                        <span>ロゴ</span>
                                        <span className="text-foreground">
                                            {tenant.tenantLogoFileId}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
};

export default TenantList;
