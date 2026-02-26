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
import { JST_LOCALE, parseDateYYYYMMDD, formatDateJST } from "./dateUtils";
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
    /** この日付スロットを削除するコールバック */
    onRemoveDate?: () => void;
    /** 日付を削除できるかどうか（2つ以上ある場合に true） */
    canRemoveDate?: boolean;
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
    onRemoveDate,
    canRemoveDate,
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
            {/* ヘッダー行: 日付ピッカー + 時間帯追加 + 日付削除 */}
            <div className="flex flex-wrap items-start gap-2">
                <Controller
                    name={`dateTimeSlots.${dateIndex}.date`}
                    control={control}
                    render={({
                        field: dateField,
                        fieldState: dateFieldState,
                    }) => {
                        const dateObj = parseDateYYYYMMDD(dateField.value);
                        const dateCrossError = crossFieldErrors.find(
                            (e) => e.path === `dateTimeSlots.${dateIndex}.date`,
                        );
                        return (
                            <div className="flex flex-col gap-0.5">
                                <Popover
                                    open={datePickerOpen}
                                    onOpenChange={setDatePickerOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={
                                                dateFieldState.invalid ||
                                                dateCrossError
                                                    ? "destructive"
                                                    : "outline"
                                            }
                                            className={cn(
                                                "w-40 justify-between font-normal",
                                                !dateField.value &&
                                                    "text-muted-foreground",
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
                                                                locale: JST_LOCALE,
                                                            },
                                                        ),
                                                    );
                                                    setDatePickerOpen(false);
                                                }
                                            }}
                                            defaultMonth={dateObj}
                                            locale={jaDayPicker}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {dateFieldState.invalid && (
                                    <FieldError
                                        errors={[dateFieldState.error]}
                                    />
                                )}
                                {!dateFieldState.invalid && dateCrossError && (
                                    <FieldError
                                        errors={[
                                            { message: dateCrossError.message },
                                        ]}
                                    />
                                )}
                            </div>
                        );
                    }}
                />
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={addTimeRange}
                >
                    時間帯を追加
                </Button>
                {canRemoveDate && onRemoveDate && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={onRemoveDate}
                    >
                        この日付を削除
                    </Button>
                )}
            </div>

            {/* 時間帯行: [開始]-[終了] [場所] [削除] */}
            {fields.map((field, timeIndex) => (
                <div
                    key={field.id}
                    className="flex flex-wrap items-center gap-2 pl-2"
                >
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

                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.end`}
                        control={control}
                        render={({ field: endField, fieldState }) => {
                            const endCrossErrors = crossFieldErrors.filter(
                                (e) =>
                                    e.path ===
                                    `dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.end`,
                            );
                            return (
                                <div className="flex flex-col gap-0.5">
                                    <Input
                                        {...endField}
                                        type="time"
                                        className="w-28"
                                        aria-label="終了時刻"
                                        aria-invalid={
                                            fieldState.invalid ||
                                            endCrossErrors.length > 0
                                        }
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                    {!fieldState.invalid &&
                                        endCrossErrors.length > 0 && (
                                            <FieldError
                                                errors={endCrossErrors.map(
                                                    (e) => ({
                                                        message: e.message,
                                                    }),
                                                )}
                                            />
                                        )}
                                </div>
                            );
                        }}
                    />

                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.locationId`}
                        control={control}
                        render={({ field: locField }) => {
                            const locCrossErrors = crossFieldErrors.filter(
                                (e) =>
                                    e.path ===
                                    `dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.locationId`,
                            );
                            return (
                                <div className="flex flex-col gap-0.5">
                                    <Select
                                        value={locField.value || "__default__"}
                                        onValueChange={(v) =>
                                            locField.onChange(
                                                v === "__default__" ? "" : v,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                "w-36",
                                                locCrossErrors.length > 0 &&
                                                    "border-destructive",
                                            )}
                                            aria-label="場所を選択"
                                            aria-invalid={
                                                locCrossErrors.length > 0
                                            }
                                        >
                                            <SelectValue placeholder="デフォルト" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__default__">
                                                デフォルト
                                            </SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem
                                                    key={loc._id}
                                                    value={loc._id}
                                                >
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {locCrossErrors.length > 0 && (
                                        <FieldError
                                            errors={locCrossErrors.map((e) => ({
                                                message: e.message,
                                            }))}
                                        />
                                    )}
                                </div>
                            );
                        }}
                    />

                    {fields.length >= 2 && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(timeIndex)}
                        >
                            削除
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
