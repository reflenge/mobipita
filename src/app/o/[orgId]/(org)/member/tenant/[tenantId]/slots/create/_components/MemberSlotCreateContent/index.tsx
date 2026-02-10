"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MapCoordinatePicker,
    MapCoordinatePickerProvider,
} from "@/components/map/pic";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";


type Props = {
    orgId: string;
    tenantId: string;
};


export function MemberSlotCreateContent({ orgId, tenantId }: Props) {
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });
    // 地図から逆ジオコーディングで取得した住所（ユーザー編集不可）
    const [coordinates, setCoordinates] = React.useState<{
        lat: number;
        lng: number;
    } | null>(null);

    useEffect(() => {
        console.log("1", coordinates);
    }, [coordinates]);

    // tenant が取得できていない（undefined / null）の場合はローディング表示
    if (!tenant) {
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

    return (
        <div className="mx-auto container px-6 py-10">
            <div>
                <div className="text-xl">予約枠作成</div>
                <p className="text-sm text-muted-foreground">
                    {tenant.tenantName} の予約枠を新規作成します
                </p>
            </div>

            <MapCoordinatePickerProvider
                defaultValue={coordinates}
                onChange={setCoordinates}
            >
                <MapCoordinatePicker />
            </MapCoordinatePickerProvider>


        </div>
    );
}
