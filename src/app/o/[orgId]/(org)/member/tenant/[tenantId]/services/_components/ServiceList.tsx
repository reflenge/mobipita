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
import { Link } from "@/components/link";

function stripHtml(html: string, maxLength: number): string {
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "…";
}

type ServiceListProps = {
    orgId: string;
    tenantId: string;
};

export function ServiceList({ orgId, tenantId }: ServiceListProps) {
    const services = useQuery(api.services.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
        limit: 50,
    });

    if (!services) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`service-skeleton-${index}`}>
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

    if (services.length === 0) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>サービスはまだありません</CardTitle>
                    <CardDescription>
                        最初のサービスを作成して、予約メニューを用意しましょう。
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
                <Link
                    key={service._id}
                    href={`/o/${orgId}/member/tenant/${tenantId}/services/${service._id}`}
                >
                    <Card className="transition hover:border-primary/50 hover:shadow-md">
                        <CardHeader className="gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle className="text-lg line-clamp-2">
                                    {service.title}
                                </CardTitle>
                                <Badge
                                    variant={
                                        service.isActive ? "default" : "secondary"
                                    }
                                >
                                    {service.isActive ? "有効" : "無効"}
                                </Badge>
                            </div>
                            <CardDescription className="line-clamp-3">
                                {stripHtml(service.description, 120)}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
