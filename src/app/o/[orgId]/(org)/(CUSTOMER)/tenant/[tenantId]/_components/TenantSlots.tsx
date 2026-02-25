"use client";

/**
 * TenantSlots コンポーネント (テナント別予約枠一覧)
 *
 * 役割: 特定のテナント (tenantId) の情報を取得し、そのテナントが提供するすべての
 * 予約可能枠 (Slot) を日付ごとにグループ化して、カード形式のリストで一覧表示する。
 * 各スロットの「予約する」ボタンから、対象枠の予約フォーム（book/[slotId]）へ遷移する。
 */
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
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

type Props = { orgId: string; tenantId: string };

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

type SlotItem = {
    _id: string;
    startAt: string;
    endAt: string;
    capacity: number;
    remaining: number;
    serviceName: string;
    locationName: string;
};

export function TenantSlots({ orgId, tenantId }: Props) {
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    const slots = useQuery(api.slots.listAvailableByTenant, {
        tenantId: tenantId as Id<"Tenants">,
    });

    const groupedByDate = useMemo(() => {
        if (!slots) return [];
        const map = new Map<string, SlotItem[]>();
        for (const slot of slots) {
            const dateKey = slot.startAt.slice(0, 10);
            const group = map.get(dateKey) ?? [];
            group.push(slot as unknown as SlotItem);
            map.set(dateKey, group);
        }
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, items]) => items);
    }, [slots]);

    if (tenant === undefined || slots === undefined) {
        return (
            <div className="mx-auto max-w-2xl py-10 px-6">
                <div className="flex h-40 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                    読み込み中...
                </div>
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="mx-auto max-w-2xl py-10 px-6">
                <p className="text-muted-foreground">テナントが見つかりません。</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl py-10 px-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">{tenant.tenantName}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    予約可能な枠を選択してください
                </p>
            </div>

            {groupedByDate.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        現在予約可能な枠はありません
                    </CardContent>
                </Card>
            )}

            {groupedByDate.map((dateSlots) => {
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
                                                <Link href={`/o/${orgId}/tenant/${tenantId}/book/${slot._id}`}>
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
