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
import { LocationMapSingle } from "@/components/map/pic/LocationMapSingle";

const typeLabels: Record<string, string> = {
    fixed: "固定店舗",
    mobile: "移動店舗",
};

type LocationDetailProps = {
    orgId: string;
    tenantId: string;
    locationId: string;
};

export function LocationDetail({
    orgId,
    tenantId,
    locationId,
}: LocationDetailProps) {
    const location = useQuery(api.locations.getByIdInOrg, {
        clerkOrgId: orgId,
        locationId: locationId as Id<"Locations">,
    });

    if (location === undefined) {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (location === null) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>場所が見つかりません</CardTitle>
                    <CardDescription>
                        指定された場所は存在しないか、アクセスできません。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href={`/o/${orgId}/member/tenant/${tenantId}/locations`}
                    >
                        <Button variant="outline">場所一覧へ</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const type = typeLabels[location.type] ?? "不明";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="text-2xl">{location.name}</CardTitle>
                    <Badge variant="secondary">{type}</Badge>
                </div>
                <CardDescription>{location.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        地図
                    </h3>
                    <LocationMapSingle
                        lat={location.lat}
                        lng={location.lng}
                        type={location.type}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">緯度</span>
                    <span className="font-mono">{location.lat}</span>
                    <span className="text-muted-foreground">経度</span>
                    <span className="font-mono">{location.lng}</span>
                </div>
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary underline hover:no-underline text-sm"
                >
                    Google Mapsで開く
                </a>
                {location.details && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                        {location.details}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
