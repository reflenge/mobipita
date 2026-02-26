"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

type Props = {
    tenantId: string;
};

export function MemberTenantContent({ tenantId }: Props) {
    const tenant = useQuery(api.tenants.getById, {
        tenantId: tenantId as Id<"Tenants">,
    });

    if (tenant === undefined) {
        return (
            <div className="container mx-auto px-6 py-10">
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
            <div className="container mx-auto px-6 py-10">
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>テナントが見つかりません</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href="/staff">
                                Member トップへ
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        {tenant.tenantName}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                        /{tenant.tenantSlug}
                    </p>
                </CardHeader>
            </Card>
        </div>
    );
}
