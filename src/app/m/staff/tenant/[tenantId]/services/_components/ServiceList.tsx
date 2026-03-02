"use client";

import { useQuery } from "convex/react";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { TiptapViewer } from "@/components/Tiptap/viewer";
import { Link } from "@/components/link";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ServiceListProps = {
    tenantId: string;
};

export function ServiceList({ tenantId }: ServiceListProps) {
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
                    href={`/m/staff/tenant/${tenantId}/services/${service._id}`}
                >
                    <Card className="hover:border-primary/50 transition hover:shadow-md">
                        <CardHeader className="gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle className="line-clamp-2 text-lg">
                                    {service.title}
                                </CardTitle>
                                <Badge
                                    variant={
                                        service.isActive
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {service.isActive ? "有効" : "無効"}
                                </Badge>
                            </div>
                            <CardDescription>
                                <TiptapViewer
                                    content={service.description}
                                    lines={4}
                                />
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
