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

const typeLabels: Record<string, string> = {
    fixed: "固定店舗",
    mobile: "移動店舗",
};

type LocationListProps = {
    orgId: string;
    tenantId: string;
};

export function LocationList({ orgId, tenantId }: LocationListProps) {
    const locations = useQuery(api.locations.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
        limit: 50,
    });

    if (!locations) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card key={`location-skeleton-${index}`}>
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

    if (locations.length === 0) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>場所はまだありません</CardTitle>
                    <CardDescription>
                        最初の場所を作成して、予約の受付を始めましょう。
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {locations.map((location) => {
                const type = typeLabels[location.type] ?? "不明";
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
                return (
                    <Link
                        key={location._id}
                        href={`/o/${orgId}/member/tenant/${tenantId}/locations/${location._id}`}
                    >
                        <Card className="transition hover:border-primary/50 hover:shadow-md">
                            <CardHeader className="gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <CardTitle className="text-lg">
                                        {location.name}
                                    </CardTitle>
                                    <Badge variant="secondary">{type}</Badge>
                                </div>
                                <CardDescription>
                                    {location.address}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>緯度</span>
                                    <span className="font-mono text-foreground">
                                        {location.lat}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>経度</span>
                                    <span className="font-mono text-foreground">
                                        {location.lng}
                                    </span>
                                </div>
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="block pt-2 text-primary underline hover:no-underline"
                                >
                                    Google Mapsで開く
                                </a>
                                {location.details && (
                                    <p className="pt-2 text-muted-foreground line-clamp-2">
                                        {location.details}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
