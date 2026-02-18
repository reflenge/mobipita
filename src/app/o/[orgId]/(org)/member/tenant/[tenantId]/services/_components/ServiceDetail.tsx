"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/link";

type ServiceDetailProps = {
    orgId: string;
    tenantId: string;
    serviceId: string;
};

export function ServiceDetail({
    orgId,
    tenantId,
    serviceId,
}: ServiceDetailProps) {
    const service = useQuery(api.services.getByIdInOrg, {
        clerkOrgId: orgId,
        serviceId: serviceId as Id<"Services">,
    });

    if (service === undefined) {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (service === null) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>サービスが見つかりません</CardTitle>
                    <CardDescription>
                        指定されたサービスは存在しないか、アクセスできません。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href={`/o/${orgId}/member/tenant/${tenantId}/services`}
                    >
                        <Button variant="outline">サービス一覧へ</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <Badge
                        variant={service.isActive ? "default" : "secondary"}
                    >
                        {service.isActive ? "有効" : "無効"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        説明
                    </h3>
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: service.description,
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
