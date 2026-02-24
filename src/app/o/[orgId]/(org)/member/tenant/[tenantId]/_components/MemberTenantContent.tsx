"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

type Props = {
    orgId: string;
    tenantId: string;
};

export function MemberTenantContent({ orgId, tenantId }: Props) {
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    if (tenant === undefined) {
        return (
            <div className="mx-auto container px-6 py-10">
                <Card>
                    <CardHeader className="gap-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="mx-auto container px-6 py-10">
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>テナントが見つかりません</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href={`/o/${orgId}/member`}>
                                Member トップへ
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto container px-6 py-10">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                            <CardTitle className="text-xl">{tenant.tenantName}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                /{tenant.tenantSlug}
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/o/${orgId}/member/tenant/${tenantId}/detail/edit`}>
                                詳細編集
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span>テナント名</span>
                        <span className="text-foreground">{tenant.tenantName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>連絡先（電話）</span>
                        <span className="text-foreground">
                            {tenant.phoneNumber ?? "未設定"}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
