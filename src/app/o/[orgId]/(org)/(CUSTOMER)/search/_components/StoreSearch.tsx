"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { MapMultiPin } from "@/components/map";
import type { MarkerItem } from "@/components/map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LocateFixed, Search } from "lucide-react";

/** 2点間の距離を km で返す（Haversine） */
function haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

type LocationWithDistance = {
    _id: Id<"Locations">;
    tenantId: Id<"Tenants">;
    tenantName: string;
    type: "fixed" | "mobile";
    name: string;
    autoAddress: string;
    semiAddress: string;
    lat: number;
    lng: number;
    details: string;
    distanceKm: number;
};

function filterByKeyword<T extends { name: string; tenantName: string; semiAddress: string }>(
    items: T[],
    keyword: string
): T[] {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
        (loc) =>
            loc.name.toLowerCase().includes(q) ||
            loc.tenantName.toLowerCase().includes(q) ||
            loc.semiAddress.toLowerCase().includes(q)
    );
}

type StoreSearchProps = { orgId: string };

export function StoreSearch({ orgId }: StoreSearchProps) {
    const [basePoint, setBasePoint] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [keyword, setKeyword] = useState("");

    const locations = useQuery(api.locations.listLocationsByOrg, {
        clerkOrgId: orgId,
        limit: 500,
    });

    const useCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) =>
                setBasePoint({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                }),
            () => {}
        );
    }, []);

    const sortedWithDistance = useMemo(() => {
        if (!locations || !basePoint) return null;
        return [...locations]
            .map((loc) => ({
                ...loc,
                distanceKm: haversineKm(
                    basePoint.lat,
                    basePoint.lng,
                    loc.lat,
                    loc.lng
                ),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm);
    }, [locations, basePoint]);

    const filteredList = useMemo(() => {
        if (!sortedWithDistance) return null;
        return filterByKeyword(sortedWithDistance, keyword);
    }, [sortedWithDistance, keyword]);

    const mapMarkers: MarkerItem[] = useMemo(
        () =>
            (locations ?? []).map((loc) => ({
                lat: loc.lat,
                lng: loc.lng,
                type: loc.type,
                name: loc.name,
            })),
        [locations]
    );

    const hasLocations = locations && locations.length > 0;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-2xl font-semibold">店舗検索</h1>

            {/* フリー入力検索ボックス + 現在地から探すボタン */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="店舗名・テナント名・住所で検索"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="pl-9"
                        aria-label="検索"
                    />
                </div>
                <Button
                    type="button"
                    onClick={useCurrentLocation}
                    className="shrink-0"
                >
                    <LocateFixed className="mr-2 size-4" />
                    現在地から探す
                </Button>
            </div>

            {/* 店舗マーカー付き地図 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">店舗マップ</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        青＝固定店舗、オレンジ＝移動店舗
                    </p>
                </CardHeader>
                <CardContent>
                    {hasLocations ? (
                        <MapMultiPin
                            markers={mapMarkers}
                            center={basePoint ?? undefined}
                            zoom={13}
                            className="w-full aspect-video"
                        />
                    ) : (
                        <div className="flex w-full aspect-video items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                            表示する店舗がありません
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 近い順リスト */}
            {basePoint && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            近い順リスト
                            {filteredList && (
                                <span className="ml-2 font-normal text-muted-foreground">
                                    （{filteredList.length}件）
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredList && filteredList.length > 0 ? (
                            <ul className="space-y-3">
                                {filteredList.map((loc) => (
                                    <li
                                        key={loc._id}
                                        className="rounded-lg border p-3"
                                    >
                                        <div className="text-lg font-semibold">
                                            {loc.name}
                                        </div>
                                        <div className="mt-0.5 text-sm text-muted-foreground">
                                            {loc.tenantName}
                                        </div>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {loc.semiAddress}
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {loc.type === "fixed"
                                                ? "固定店舗"
                                                : "移動店舗"}
                                            {" · "}
                                            <span className="font-medium text-foreground">
                                                {loc.distanceKm < 1
                                                    ? `${(loc.distanceKm * 1000).toFixed(0)} m`
                                                    : `${loc.distanceKm.toFixed(2)} km`}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {keyword.trim()
                                    ? "検索条件に一致する店舗はありません"
                                    : "該当する店舗はありません"}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {!basePoint && (
                <p className="text-sm text-muted-foreground">
                    「現在地から探す」を押すと、近い順の店舗一覧が表示されます。
                </p>
            )}

            {locations && locations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    この組織に登録されている店舗はありません。
                </p>
            )}
        </div>
    );
}
