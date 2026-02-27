"use client";

/**
 * StoreSearch コンポーネント (場所から探す)
 *
 * 役割: マップやキーワード・現在地（GPS機能）を用いてロケーション（店舗や移動拠点）を検索し、
 * 選択した該当場所で予約可能な枠一覧を表示する。
 * 主な機能:
 * - キーワード検索 (店舗名、テナント名、住所での絞り込み)
 * - サブコンポーネント MapMultiPin による店舗位置のマップ表示
 * - 現在地からの直線距離によるソート表示（ハヴァーサイン公式による距離計算 `haversineKm`）
 * - 特定の場所選択後、それに紐づく予約枠一覧（SlotResultList）の表示
 */
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowLeftIcon, CalendarPlus, LocateFixed, Search } from "lucide-react";
import type { Id } from "@/../convex/_generated/dataModel";
import type { MarkerItem } from "@/components/map";
import { api } from "@/../convex/_generated/api";
import {
    SlotResultList,
    type SlotResult,
} from "@/app/(main)/(customer)/_components/SlotResultList";
import { MapMultiPin } from "@/components/map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
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

function filterByKeyword<
    T extends { name: string; tenantName: string; semiAddress: string },
>(items: T[], keyword: string): T[] {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
        (loc) =>
            loc.name.toLowerCase().includes(q) ||
            loc.tenantName.toLowerCase().includes(q) ||
            loc.semiAddress.toLowerCase().includes(q),
    );
}

export function StoreSearch() {
    const [basePoint, setBasePoint] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [keyword, setKeyword] = useState("");
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
        null,
    );

    const locations = useQuery(api.locations.listAll, {
        limit: 500,
    });

    const slots = useQuery(
        api.slots.listAvailable,
        selectedLocationId
            ? {
                  locationId: selectedLocationId as Id<"Locations">,
              }
            : "skip",
    );

    const useCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) =>
                setBasePoint({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                }),
            () => {},
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
                    loc.lng,
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
        [locations],
    );

    const hasLocations = locations && locations.length > 0;

    if (selectedLocationId) {
        const loc = locations?.find((l) => l._id === selectedLocationId);
        return (
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLocationId(null)}
                    >
                        <ArrowLeftIcon className="mr-1 size-4" />
                        場所一覧に戻る
                    </Button>
                </div>
                <div>
                    <h1 className="text-xl font-semibold">
                        {loc?.name ?? "選択中"}
                    </h1>
                    {loc && (
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            {loc.tenantName} · {loc.semiAddress}
                        </p>
                    )}
                </div>
                <SlotResultList
                    slots={slots as SlotResult[] | undefined}
                    emptyMessage="この場所では予約可能な枠がありません"
                />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="text-2xl font-semibold">場所から探す</h1>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">店舗マップ</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        青＝固定店舗、オレンジ＝移動店舗
                    </p>
                </CardHeader>
                <CardContent>
                    {hasLocations ? (
                        <MapMultiPin
                            markers={mapMarkers}
                            center={basePoint ?? undefined}
                            zoom={13}
                            className="aspect-video w-full"
                        />
                    ) : (
                        <div className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-md border text-sm">
                            表示する店舗がありません
                        </div>
                    )}
                </CardContent>
            </Card>

            {basePoint && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            近い順リスト
                            {filteredList && (
                                <span className="text-muted-foreground ml-2 font-normal">
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
                                        <div className="text-muted-foreground mt-0.5 text-sm">
                                            {loc.tenantName}
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-sm">
                                            {loc.semiAddress}
                                        </div>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-muted-foreground text-xs">
                                                {loc.type === "fixed"
                                                    ? "固定店舗"
                                                    : "移動店舗"}
                                                {" · "}
                                                <span className="text-foreground font-medium">
                                                    {loc.distanceKm < 1
                                                        ? `${(loc.distanceKm * 1000).toFixed(0)} m`
                                                        : `${loc.distanceKm.toFixed(2)} km`}
                                                </span>
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setSelectedLocationId(
                                                        loc._id,
                                                    )
                                                }
                                            >
                                                <CalendarPlus className="mr-1 size-3.5" />
                                                予約枠を見る
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                {keyword.trim()
                                    ? "検索条件に一致する店舗はありません"
                                    : "該当する店舗はありません"}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {!basePoint && (
                <p className="text-muted-foreground text-sm">
                    「現在地から探す」を押すと、近い順の店舗一覧が表示されます。
                </p>
            )}

            {locations && locations.length === 0 && (
                <p className="text-muted-foreground text-sm">
                    登録されている店舗はありません。
                </p>
            )}
        </div>
    );
}
