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

export function MemberSlotCreateContent({ orgId, tenantId }: Props) {
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    if (tenant === undefined) {
        return (
            <div className="mx-auto container px-6 py-10">
                <Card>
                    <CardHeader className="gap-3">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
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
            <div>
                <div className="text-xl">予約枠作成</div>
                <p className="text-sm text-muted-foreground">
                    {tenant.tenantName} の予約枠を新規作成します
                </p>
            </div>
        </div>
    );
}
