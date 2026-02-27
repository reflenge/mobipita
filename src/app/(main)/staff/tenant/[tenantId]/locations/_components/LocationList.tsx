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

const typeLabels: Record<string, string> = {
    fixed: "固定店舗",
    mobile: "移動店舗",
};

type LocationListProps = {
    tenantId: string;
};

export function LocationList({ tenantId }: LocationListProps) {
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
                const detailHref = `/staff/tenant/${tenantId}/locations/${location._id}`;
                return (
                    <Card
                        key={location._id}
                        className="hover:border-primary/50 transition hover:shadow-md"
                    >
                        <CardHeader className="gap-3">
                            <div className="flex items-center justify-between gap-3">
                                <CardTitle className="text-lg">
                                    <Link
                                        href={detailHref}
                                        className="hover:underline focus:underline"
                                    >
                                        {location.name}
                                    </Link>
                                </CardTitle>
                                <Badge variant="secondary">{type}</Badge>
                            </div>
                            <CardDescription>
                                {location.semiAddress}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>緯度</span>
                                <span className="text-foreground font-mono">
                                    {location.lat}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>経度</span>
                                <span className="text-foreground font-mono">
                                    {location.lng}
                                </span>
                            </div>
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary block pt-2 underline hover:no-underline"
                            >
                                Google Mapsで開く
                            </a>
                            {location.details && (
                                <div className="text-muted-foreground pt-2">
                                    <TiptapViewer
                                        content={location.details}
                                        lines={2}
                                    />
                                </div>
                            )}
                            <Link
                                href={detailHref}
                                className="text-primary inline-block pt-2 text-sm font-medium hover:underline"
                            >
                                詳細を見る →
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
