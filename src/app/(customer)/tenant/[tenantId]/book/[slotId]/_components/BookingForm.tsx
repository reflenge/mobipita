"use client";

/**
 * BookingForm コンポーネント (予約フォーム)
 *
 * 役割: 選択された特定の予約枠 (slotId) に対する予約手続きを行う。
 * 枠の設定情報から動的な質問項目 (questions) をUIとして生成し、顧客からの回答を収集する。
 *
 * 主な機能:
 * - 枠の空き状況とステータス（open かつ 残り枠 > 0）の確認
 * - 動的フォームの描画（type: text, tel, email, textarea の出し分け）
 * - 必須項目の入力チェック（フロントエンドバリデーション）
 * - `api.bookings.create` への予約確定リクエストと、成功時のマイ予約一覧へのリダイレクト
 */
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    UsersIcon,
    SendIcon,
    ArrowLeftIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Props = { tenantId: string; slotId: string };

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

type Question = {
    id: string;
    label: string;
    type: string;
    required: boolean;
};

function QuestionField({
    question,
    value,
    onChange,
}: {
    question: Question;
    value: string;
    onChange: (v: string) => void;
}) {
    const id = `q-${question.id}`;
    const inputProps = {
        id,
        value,
        onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => onChange(e.target.value),
        required: question.required,
    };

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>
                {question.label}
                {question.required && (
                    <span className="text-destructive ml-1">*</span>
                )}
            </Label>
            {question.type === "textarea" ? (
                <Textarea {...inputProps} rows={3} />
            ) : (
                <Input
                    {...inputProps}
                    type={
                        question.type === "tel"
                            ? "tel"
                            : question.type === "email"
                              ? "email"
                              : "text"
                    }
                />
            )}
        </div>
    );
}

export function BookingForm({ tenantId, slotId }: Props) {
    const router = useRouter();
    const slot = useQuery(api.bookings.getSlotForBooking, {
        slotId: slotId as Id<"Slots">,
    });
    const createBooking = useMutation(api.bookings.create);

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerChange = useCallback(
        (questionId: string, value: string) => {
            setAnswers((prev) => ({ ...prev, [questionId]: value }));
        },
        [],
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!slot) return;

            const questions = slot.questions ?? [];
            for (const q of questions) {
                if (q.required && !answers[q.id]?.trim()) {
                    toast.error(`「${q.label}」は必須です`);
                    return;
                }
            }

            setIsSubmitting(true);
            try {
                await createBooking({
                    slotId: slotId as Id<"Slots">,
                    answers: JSON.stringify(answers),
                });
                toast.success("予約が完了しました");
                router.push("/bookings");
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "予約に失敗しました",
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [slot, answers, createBooking, slotId, router],
    );

    if (slot === undefined) {
        return (
            <div className="mx-auto max-w-lg px-6 py-10">
                <div className="bg-muted text-muted-foreground flex h-40 items-center justify-center rounded-md border text-sm">
                    読み込み中...
                </div>
            </div>
        );
    }

    if (!slot) {
        return (
            <div className="mx-auto max-w-lg px-6 py-10">
                <p className="text-muted-foreground">
                    スロットが見つかりません。
                </p>
            </div>
        );
    }

    const isAvailable = slot.slotStatus === "open" && slot.remaining > 0;

    return (
        <div className="mx-auto max-w-lg space-y-6 px-6 py-10">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tenant/${tenantId}`}>
                        <ArrowLeftIcon className="size-4" />
                        戻る
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {slot.serviceName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="text-muted-foreground size-4" />
                        {formatDate(slot.startAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <ClockIcon className="text-muted-foreground size-4" />
                        {formatTime(slot.startAt)} 〜 {formatTime(slot.endAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <MapPinIcon className="text-muted-foreground size-4" />
                        {slot.locationName}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="text-muted-foreground size-4" />
                        残り {slot.remaining}/{slot.capacity}
                        {slot.remaining <= 2 && (
                            <Badge
                                variant="destructive"
                                className="text-[10px]"
                            >
                                残りわずか
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!isAvailable ? (
                <Card>
                    <CardContent className="text-muted-foreground py-8 text-center">
                        この枠は現在予約できません
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            予約フォーム
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {slot.questions.length > 0 ? (
                                slot.questions.map((q) => (
                                    <QuestionField
                                        key={q.id}
                                        question={q}
                                        value={answers[q.id] ?? ""}
                                        onChange={(v) =>
                                            handleAnswerChange(q.id, v)
                                        }
                                    />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">
                                    入力項目はありません
                                </p>
                            )}

                            <Separator />

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? (
                                    "予約中..."
                                ) : (
                                    <>
                                        <SendIcon className="mr-2 size-4" />
                                        予約を確定する
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
