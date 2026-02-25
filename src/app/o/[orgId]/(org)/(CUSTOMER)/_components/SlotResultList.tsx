"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/components/link";
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UsersIcon,
} from "lucide-react";

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
    orgId,
    emptyMessage,
}: {
    slots: SlotResult[] | undefined;
    orgId: string;
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
            <div className="flex h-32 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                読み込み中...
            </div>
        );
    }

    if (grouped.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
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
                                <CalendarIcon className="size-4 text-muted-foreground" />
                                {formatDate(dateStr)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {dateSlots.map((slot, i) => (
                                <div key={slot._id}>
                                    {i > 0 && <Separator className="my-2" />}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <ClockIcon className="size-3.5 text-muted-foreground shrink-0" />
                                                {formatTime(slot.startAt)} 〜 {formatTime(slot.endAt)}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate">
                                                {slot.serviceName}
                                                <span className="mx-1">·</span>
                                                {slot.tenantName}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPinIcon className="size-3" />
                                                    {slot.locationName}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <UsersIcon className="size-3" />
                                                    残り {slot.remaining}/{slot.capacity}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center gap-2">
                                            {slot.remaining <= 2 && (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    残りわずか
                                                </Badge>
                                            )}
                                            <Button asChild size="sm">
                                                <Link href={`/o/${orgId}/tenant/${slot.tenantId}/book/${slot._id}`}>
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
