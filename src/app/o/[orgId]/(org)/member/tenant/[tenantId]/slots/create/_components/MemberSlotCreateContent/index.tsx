"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { MapCoordinatePicker } from "./MapCoordinatePicker";
import { format, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";

type Props = {
    orgId: string;
    tenantId: string;
};

const JST_TZ = "Asia/Tokyo";

function toZonedDate(date: Date, timeZone: string) {
    // Intl の timeZone を使って「そのタイムゾーンの現在時刻」を Date として得る
    // （Date 自体は UTC ベースだが、toLocaleString 経由でタイムゾーン補正された値を生成できる）
    return new Date(date.toLocaleString("en-US", { timeZone }));
}

function formatYmdDowJst(date: Date) {
    // date-fns の format は「Date オブジェクトが表すローカル時刻」を元に表示するため、
    // 一度 JST の wall-time に変換した Date を作ってから format する。
    const jstDate = toZonedDate(date, JST_TZ);
    return format(jstDate, "yyyy/MM/dd (EEE)", { locale: ja });
}

export function MemberSlotCreateContent({ orgId, tenantId }: Props) {
    const today = startOfDay(toZonedDate(new Date(), JST_TZ));
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
        today,
    );
    // ユーザーが自由入力する場所欄
    const [location, setLocation] = React.useState<string>("");
    // 地図から逆ジオコーディングで取得した住所（ユーザー編集不可）
    const [mapAddress, setMapAddress] = React.useState<string>("");
    const [isResolvingAddress, setIsResolvingAddress] =
        React.useState<boolean>(false);
    const [addressError, setAddressError] = React.useState<string | null>(null);
    const [coordinates, setCoordinates] = React.useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [startTime, setStartTime] = React.useState<string>("09:00");
    const [endTime, setEndTime] = React.useState<string>("18:00");
    const [slotLocationSource, setSlotLocationSource] = React.useState<
        "manual" | "map"
    >("manual");

    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    const isFixedStore = tenant?.storeType === "fixed";
    const resolvedSlotLocation =
        slotLocationSource === "manual" ? location : mapAddress;

    React.useEffect(() => {
        if (!isFixedStore) return;
        if (!coordinates) return;

        const controller = new AbortController();
        const { lat, lng } = coordinates;
        const roundedKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;

        setIsResolvingAddress(true);
        setAddressError(null);

        const timeout = setTimeout(async () => {
            try {
                // OpenStreetMap Nominatim reverse geocoding
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
                        lat,
                    )}&lon=${encodeURIComponent(lng)}&accept-language=ja`,
                    {
                        signal: controller.signal,
                        headers: {
                            // Nominatim は UA 推奨だが、ブラウザ制限があるため最低限のヘッダーに留める
                            "Accept": "application/json",
                        },
                    },
                );

                if (!res.ok) {
                    throw new Error(`reverse geocode failed: ${res.status}`);
                }

                const data: { display_name?: string } = await res.json();
                if (!data.display_name) {
                    throw new Error("住所を取得できませんでした");
                }

                // 座標が変わっていないときだけ反映（古い結果の上書きを防ぐ）
                const currentKey = `${coordinates.lat.toFixed(
                    6,
                )},${coordinates.lng.toFixed(6)}`;
                if (currentKey === roundedKey) {
                    setMapAddress(data.display_name);
                }
            } catch (e) {
                if ((e as { name?: string }).name === "AbortError") return;
                setAddressError(
                    "地図から住所を取得できませんでした（手入力してください）",
                );
            } finally {
                setIsResolvingAddress(false);
            }
        }, 350);

        return () => {
            controller.abort();
            clearTimeout(timeout);
        };
    }, [coordinates, isFixedStore]);

    if (tenant === undefined) {
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

    if (!tenant) {
        return (
            <div className="mx-auto container px-6 py-10">
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>テナントが見つかりません</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href={`/o/${orgId}/member`}>
                                Member トップへ
                            </Link>
                        </Button>
                    </CardContent>
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

            {isFixedStore && (
                <div className="mt-6">
                    <Card>
                        <CardHeader className="gap-1">
                            <CardTitle className="text-base">場所</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                この予約枠が提供される店舗の場所を入力してください。
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="例: 東京都渋谷区〇〇ビル1F"
                            />
                            <div className="mt-2 text-xs text-muted-foreground">
                                {isResolvingAddress
                                    ? "地図から住所を取得中…"
                                    : addressError ?? " "}
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-foreground">
                                        地図から取得した住所（自動入力・編集不可）
                                    </p>
                                    <Input
                                        value={mapAddress}
                                        readOnly
                                        placeholder="地図をクリックすると自動で住所が表示されます"
                                        className="text-xs"
                                    />
                                </div>
                                <CardTitle className="text-sm">
                                    地図で座標を選択
                                </CardTitle>
                                <MapCoordinatePicker
                                    value={coordinates}
                                    onChange={setCoordinates}
                                />
                                <p className="text-xs text-muted-foreground">
                                    緯度/経度:
                                    {coordinates
                                        ? ` ${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
                                        : " 未選択"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="mt-6">
                <Card>
                    <CardHeader className="gap-1">
                        <CardTitle className="text-base">日付選択</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {selectedDate
                                ? formatYmdDowJst(selectedDate)
                                : "日付を選択してください"}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            timeZone={JST_TZ}
                            disabled={(date) =>
                                startOfDay(toZonedDate(date, JST_TZ)) < today
                            }
                        />
                        <div className="mt-4 space-y-3">
                            <div className="flex flex-wrap gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        開始時間
                                    </p>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className="w-28"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        終了時間
                                    </p>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        className="w-28"
                                    />
                                </div>
                            </div>

                            {isFixedStore && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                        場所選択（この営業時間に紐づける場所）
                                    </p>
                                    <select
                                        value={slotLocationSource}
                                        onChange={(e) =>
                                            setSlotLocationSource(
                                                e.target.value === "map"
                                                    ? "map"
                                                    : "manual",
                                            )
                                        }
                                        className="h-9 rounded-md border bg-background px-2 text-xs"
                                    >
                                        <option value="manual">
                                            手入力の場所を使う
                                        </option>
                                        <option value="map">
                                            地図から取得した住所を使う
                                        </option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        使用される場所:
                                        {resolvedSlotLocation
                                            ? ` ${resolvedSlotLocation}`
                                            : " 未選択"}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="button"
                                size="sm"
                                className="mt-1"
                                disabled={
                                    !selectedDate ||
                                    !startTime ||
                                    !endTime ||
                                    (isFixedStore &&
                                        !resolvedSlotLocation.trim())
                                }
                                onClick={() => {
                                    // TODO: Convex に営業時間スロットを保存する
                                    console.log("add opening hours slot", {
                                        date: selectedDate,
                                        startTime,
                                        endTime,
                                        location: resolvedSlotLocation,
                                    });
                                }}
                            >
                                この日に営業時間を追加する
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
