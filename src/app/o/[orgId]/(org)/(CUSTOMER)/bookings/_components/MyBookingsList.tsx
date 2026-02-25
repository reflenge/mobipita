"use client";

/**
 * MyBookingsList コンポーネント (マイ予約一覧)
 *
 * 役割: 顧客自身の予約履歴を取得 (api.bookings.listMyBookings) し、一覧表示する。
 * 各予約カードにステータス（仮確定、確定、キャンセル済み、未出席）のバッジを表示し、
 * キャンセル可能な予約（canCancel = true）には「予約をキャンセル」ボタンを提供する。
 *
 * 主な機能:
 * - 予約一覧の表示（ステータスに応じたスタイリングの切り替え）
 * - 予約のキャンセル処理 (api.bookings.cancel) およびキャンセル中のローディング状態管理
 * - 確認ダイアログによる誤操作防止
 */
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    XCircleIcon,
} from "lucide-react";

type Props = { orgId: string };

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "仮確定", variant: "outline" },
    confirmed: { label: "確定", variant: "default" },
    canceled: { label: "キャンセル済み", variant: "secondary" },
    no_show: { label: "未出席", variant: "destructive" },
};

function formatDate(iso: string): string {
    if (!iso) return "-";
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
    if (!iso) return "-";
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

export function MyBookingsList({ orgId }: Props) {
    const bookings = useQuery(api.bookings.listMyBookings, {});
    const cancelBooking = useMutation(api.bookings.cancel);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const handleCancel = useCallback(
        async (bookingId: string) => {
            if (!confirm("この予約をキャンセルしますか？")) return;
            setCancellingId(bookingId);
            try {
                await cancelBooking({ bookingId: bookingId as Id<"Bookings"> });
                toast.success("予約をキャンセルしました");
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "キャンセルに失敗しました",
                );
            } finally {
                setCancellingId(null);
            }
        },
        [cancelBooking],
    );

    if (bookings === undefined) {
        return (
            <div className="mx-auto max-w-2xl py-10 px-6">
                <div className="flex h-40 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                    読み込み中...
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl py-10 px-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">マイ予約</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {bookings.length}件の予約
                </p>
            </div>

            {bookings.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        まだ予約はありません
                    </CardContent>
                </Card>
            )}

            {bookings.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.status] ?? {
                    label: booking.status,
                    variant: "outline" as const,
                };
                const isCanceled = booking.status === "canceled";

                return (
                    <Card
                        key={booking._id}
                        className={isCanceled ? "opacity-60" : ""}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle
                                    className={`text-base ${isCanceled ? "line-through" : ""}`}
                                >
                                    {booking.serviceName}
                                </CardTitle>
                                <Badge variant={statusCfg.variant}>
                                    {statusCfg.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarIcon className="size-4 text-muted-foreground" />
                                {formatDate(booking.startAt)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <ClockIcon className="size-4 text-muted-foreground" />
                                {formatTime(booking.startAt)} 〜{" "}
                                {formatTime(booking.endAt)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPinIcon className="size-4 text-muted-foreground" />
                                {booking.locationName}
                            </div>

                            {booking.canCancel && (
                                <>
                                    <Separator />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={cancellingId === booking._id}
                                        onClick={() => handleCancel(booking._id)}
                                    >
                                        <XCircleIcon className="size-4 mr-1" />
                                        {cancellingId === booking._id
                                            ? "キャンセル中..."
                                            : "予約をキャンセル"}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
