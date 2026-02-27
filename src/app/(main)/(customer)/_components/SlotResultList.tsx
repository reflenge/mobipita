"use client";

/**
 * SlotResultList コンポーネント (予約可能枠一覧)
 *
 * 役割: 各検索画面（場所、日付、サービス）で取得した予約可能な枠 (Slot) リストを受け取り、
 * 日付ごとにグループ化してカード形式で一覧表示する共有UIコンポーネント。
 * 残り枠数が少ない場合の警告バッジ表示や、各枠に対応する予約フォーム画面（book/[slotId]）
 * への遷移ボタンを提供する。
 */
import { useMemo } from "react";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { Link } from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type SlotResult = {
    _id: string;
    tenantId: string;
    tenantName: string;
    serviceId: string;
    locationId: string;
    startAt: string;
    endAt: string;
    capacity: number;
    remaining: number;
    serviceName: string;
    locationName: string;
};

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "short",
        });
    } catch {
        return iso;
    }
}

function formatTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return iso;
    }
}

export function SlotResultList({
    slots,
    emptyMessage,
}: {
    slots: SlotResult[] | undefined;
    emptyMessage: string;
}) {
    const grouped = useMemo(() => {
        if (!slots) return [];
        const map = new Map<string, SlotResult[]>();
        for (const slot of slots) {
            const dateKey = slot.startAt.slice(0, 10);
            const group = map.get(dateKey) ?? [];
            group.push(slot);
            map.set(dateKey, group);
        }
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, items]) => items);
    }, [slots]);

    if (slots === undefined) {
        return (
            <div className="bg-muted text-muted-foreground flex h-32 items-center justify-center rounded-md border text-sm">
                読み込み中...
            </div>
        );
    }

    if (grouped.length === 0) {
        return (
            <Card>
                <CardContent className="text-muted-foreground py-8 text-center">
                    {emptyMessage}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {grouped.map((dateSlots) => {
                const dateStr = dateSlots[0]?.startAt ?? "";
                return (
                    <Card key={dateStr.slice(0, 10)}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarIcon className="text-muted-foreground size-4" />
                                {formatDate(dateStr)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {dateSlots.map((slot, i) => (
                                <div key={slot._id}>
                                    {i > 0 && <Separator className="my-2" />}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <ClockIcon className="text-muted-foreground size-3.5 shrink-0" />
                                                {formatTime(slot.startAt)} 〜{" "}
                                                {formatTime(slot.endAt)}
                                            </div>
                                            <div className="text-muted-foreground truncate text-sm">
                                                {slot.serviceName}
                                                <span className="mx-1">·</span>
                                                {slot.tenantName}
                                            </div>
                                            <div className="text-muted-foreground flex items-center gap-3 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <MapPinIcon className="size-3" />
                                                    {slot.locationName}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <UsersIcon className="size-3" />
                                                    残り {slot.remaining}/
                                                    {slot.capacity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {slot.remaining <= 2 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[10px]"
                                                >
                                                    残りわずか
                                                </Badge>
                                            )}
                                            <Button asChild size="sm">
                                                <Link
                                                    href={`/tenant/${slot.tenantId}/book/${slot._id}`}
                                                >
                                                    予約する
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
