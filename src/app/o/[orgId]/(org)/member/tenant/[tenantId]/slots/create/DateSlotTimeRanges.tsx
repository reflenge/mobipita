"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ja as jaDayPicker } from "react-day-picker/locale";
import {
    JST_LOCALE,
    parseDateYYYYMMDD,
    formatDateJST,
} from "./dateUtils";
import type { FormValues, CrossFieldError } from "./schema";

type Location = { _id: string; name: string };

type DateSlotTimeRangesProps = {
    /** この日付スロットの配列インデックス（dateTimeSlots[dateIndex]） */
    dateIndex: number;
    control: React.ComponentProps<typeof Controller<FormValues>>["control"];
    /**
     * useMemo で計算されたクロスフィールドエラーの配列。
     * 各エラーの path から該当フィールドのものを抽出して表示する。
     * zodResolver の fieldState とは別系統（古いエラーが残らない）。
     */
    crossFieldErrors: CrossFieldError[];
    /** テナントに紐づく場所一覧（時間帯ごとの場所選択に使用） */
    locations: Location[];
};

/**
 * 1つの日付スロット（日付ピッカー + 複数の時間帯入力）を描画するコンポーネント。
 *
 * エラー表示の仕組み:
 *   - fieldState.invalid: zodResolver によるフィールドレベルエラー（フォーマット・必須）
 *   - crossFieldErrors: 過去日付・終了>開始・長さ・重複のクロスフィールドエラー
 *   フィールドレベルエラーが優先表示され、なければクロスフィールドエラーを表示。
 */
export function DateSlotTimeRanges({
    dateIndex,
    control,
    crossFieldErrors,
    locations,
}: DateSlotTimeRangesProps) {
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name: `dateTimeSlots.${dateIndex}.timeRanges`,
    });

    const addTimeRange = () => {
        append({ start: "09:00", end: "14:00", locationId: "" });
    };

    return (
        <div className="space-y-2">
            {fields.map((field, timeIndex) => (
                <div
                    key={field.id}
                    className="flex flex-wrap items-center gap-2"
                >
                    {/* 日付ピッカー: 最初の時間帯行にのみ表示 */}
                    {timeIndex === 0 ? (
                        <Controller
                            name={`dateTimeSlots.${dateIndex}.date`}
                            control={control}
                            render={({ field: dateField, fieldState: dateFieldState }) => {
                                const dateObj = parseDateYYYYMMDD(
                                    dateField.value
                                );
                                const dateCrossError = crossFieldErrors.find(
                                    (e) => e.path === `dateTimeSlots.${dateIndex}.date`
                                );
                                return (
                                    <div className="flex flex-col gap-0.5">
                                        <Popover
                                            open={datePickerOpen}
                                            onOpenChange={setDatePickerOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-40 justify-between font-normal",
                                                        !dateField.value &&
                                                        "text-muted-foreground"
                                                    )}
                                                    aria-label="日付を選択"
                                                >
                                                    {dateField.value && dateObj ? (
                                                        formatDateJST(dateObj)
                                                    ) : (
                                                        <span>日付を選択</span>
                                                    )}
                                                    <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={dateObj}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            dateField.onChange(
                                                                format(
                                                                    date,
                                                                    "yyyy-MM-dd",
                                                                    {
                                                                        locale:
                                                                            JST_LOCALE,
                                                                    }
                                                                )
                                                            );
                                                            setDatePickerOpen(
                                                                false
                                                            );
                                                        }
                                                    }}
                                                    defaultMonth={dateObj}
                                                    locale={jaDayPicker}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {/* フィールドレベルエラー優先、なければクロスフィールドエラー */}
                                        {dateFieldState.invalid && (
                                            <FieldError errors={[dateFieldState.error]} />
                                        )}
                                        {!dateFieldState.invalid && dateCrossError && (
                                            <FieldError errors={[{ message: dateCrossError.message }]} />
                                        )}
                                    </div>
                                );
                            }}
                        />
                    ) : (
                        <span className="w-40" aria-hidden />
                    )}

                    {/* 開始時刻 */}
                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.start`}
                        control={control}
                        render={({ field: startField, fieldState }) => (
                            <div className="flex flex-col gap-0.5">
                                <Input
                                    {...startField}
                                    type="time"
                                    className="w-28"
                                    aria-label="開始時刻"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </div>
                        )}
                    />

                    <span className="text-muted-foreground">-</span>

                    {/* 終了時刻 + クロスフィールドエラー（終了>開始・長さ・重複） */}
                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.end`}
                        control={control}
                        render={({ field: endField, fieldState }) => {
                            const endCrossErrors = crossFieldErrors.filter(
                                (e) => e.path === `dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.end`
                            );
                            return (
                                <div className="flex flex-col gap-0.5">
                                    <Input
                                        {...endField}
                                        type="time"
                                        className="w-28"
                                        aria-label="終了時刻"
                                        aria-invalid={fieldState.invalid || endCrossErrors.length > 0}
                                    />
                                    {/* フィールドレベルエラー優先 */}
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    {/* フィールドレベルエラーがなければクロスフィールドエラーを表示 */}
                                    {!fieldState.invalid && endCrossErrors.length > 0 && (
                                        <FieldError errors={endCrossErrors.map((e) => ({ message: e.message }))} />
                                    )}
                                </div>
                            );
                        }}
                    />

                    {/* 時間帯ごとの場所選択（空 = デフォルトの場所を使用） */}
                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.locationId`}
                        control={control}
                        render={({ field: locField }) => {
                            const locCrossErrors = crossFieldErrors.filter(
                                (e) => e.path === `dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.locationId`
                            );
                            return (
                                <div className="flex flex-col gap-0.5">
                                    <Select
                                        value={locField.value || "__default__"}
                                        onValueChange={(v) => locField.onChange(v === "__default__" ? "" : v)}
                                    >
                                        <SelectTrigger
                                            className={cn("w-36", locCrossErrors.length > 0 && "border-destructive")}
                                            aria-label="場所を選択"
                                            aria-invalid={locCrossErrors.length > 0}
                                        >
                                            <SelectValue placeholder="デフォルト" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__default__">
                                                デフォルト
                                            </SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc._id} value={loc._id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {locCrossErrors.length > 0 && (
                                        <FieldError errors={locCrossErrors.map((e) => ({ message: e.message }))} />
                                    )}
                                </div>
                            );
                        }}
                    />

                    {/* 時間帯追加ボタン: 最初の行にのみ表示 */}
                    {timeIndex === 0 ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTimeRange}
                        >
                            この日にちに別の時間帯を追加
                        </Button>
                    ) : null}

                    {/* 時間帯削除ボタン: 2行以上ある場合のみ表示 */}
                    {fields.length >= 2 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(timeIndex)}
                        >
                            この時間帯を削除
                        </Button>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
