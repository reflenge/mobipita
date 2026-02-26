"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
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

type TenantDetailProps = {
    tenantId: string;
};

const TenantDetail = ({ tenantId }: TenantDetailProps) => {
    const tenant = useQuery(api.tenants.getById, {
        tenantId: tenantId as Id<"Tenants">,
    });

    if (tenant === undefined) {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-44" />
                </CardContent>
            </Card>
        );
    }

    if (!tenant) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>テナントが見つかりません</CardTitle>
                    <CardDescription>
                        すでに削除されたか、権限がありません。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/company/tenant">一覧へ戻る</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const status = statusLabels[tenant.tenantStatus] ?? "不明";
    const type = typeLabels[tenant.tenantType] ?? "不明";
    const createdAt = new Date(tenant._creationTime).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-xl">
                        {tenant.tenantName}
                    </CardTitle>
                    <Badge
                        variant={
                            statusVariant[tenant.tenantStatus] ?? "outline"
                        }
                    >
                        {status}
                    </Badge>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{type}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4 text-sm">
                <div className="flex items-center justify-between">
                    <span>テナント ID</span>
                    <span className="text-foreground">{tenant._id}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span>作成者</span>
                    <span className="text-foreground">
                        {tenant.createdByUserId ?? "不明"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span>作成日時</span>
                    <span className="text-foreground">{createdAt}</span>
                </div>
                {tenant.tenantLogoFileId && (
                    <div className="flex items-center justify-between">
                        <span>ロゴファイル</span>
                        <span className="text-foreground">
                            {tenant.tenantLogoFileId}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TenantDetail;
