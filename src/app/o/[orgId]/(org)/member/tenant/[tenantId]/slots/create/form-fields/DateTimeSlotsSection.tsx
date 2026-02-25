"use client";

import { useCallback } from "react";
import { useFieldArray, useFormState, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { DateSlotTimeRanges } from "../DateSlotTimeRanges";
import { addDaysToYYYYMMDD, getTodayYYYYMMDD } from "../dateUtils";
import type { FormValues, CrossFieldError } from "../schema";
import type { Control } from "react-hook-form";

type Location = { _id: string; name: string };

type Props = {
    control: Control<FormValues>;
    /** createSlot の useMemo で計算されたクロスフィールドエラー */
    crossFieldErrors: CrossFieldError[];
    /** テナントに紐づく場所一覧（時間帯ごとの場所選択に使用） */
    locations: Location[];
};

/**
 * 「枠の日時」セクション全体を描画するコンポーネント。
 * 日付スロット（DateSlotTimeRanges）の一覧と、追加・削除ボタンを管理する。
 */
export function DateTimeSlotsSection({
    control,
    crossFieldErrors,
    locations,
}: Props) {
    const dateTimeSlots = useWatch({ control, name: "dateTimeSlots" });
    const { errors } = useFormState({ control });
    const {
        fields: dateSlotFields,
        append: appendDateSlot,
        remove: removeDateSlot,
    } = useFieldArray({
        control,
        name: "dateTimeSlots",
    });

    /** 「日付を追加」ボタンで使用する次の日付を算出（最新日 + 1日） */
    const getNextDate = useCallback((): string => {
        const dates = (dateTimeSlots ?? [])
            .map((slot) => slot?.date)
            .filter((d): d is string => Boolean(d));
        if (dates.length === 0) return getTodayYYYYMMDD();
        const latest = dates.sort().at(-1) ?? getTodayYYYYMMDD();
        return addDaysToYYYYMMDD(latest, 1);
    }, [dateTimeSlots]);

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <FieldLabel>枠の日時</FieldLabel>
                    <FieldDescription>
                        予約枠を作成する日付と時間帯を指定します。
                    </FieldDescription>
                </div>
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() =>
                        appendDateSlot({
                            date: getNextDate(),
                            timeRanges: [
                                {
                                    start: "09:00",
                                    end: "14:00",
                                    locationId: "",
                                },
                            ],
                        })
                    }
                >
                    日付を追加
                </Button>
            </div>
            <div className="space-y-4">
                {dateSlotFields.map((field, dateIndex) => (
                    <div
                        key={field.id}
                        className="space-y-2 rounded border p-3"
                    >
                        <DateSlotTimeRanges
                            dateIndex={dateIndex}
                            control={control}
                            crossFieldErrors={crossFieldErrors}
                            locations={locations}
                            canRemoveDate={dateSlotFields.length >= 2}
                            onRemoveDate={() => removeDateSlot(dateIndex)}
                        />
                    </div>
                ))}
            </div>
            {/* dateTimeSlots 配列レベルのエラー（例: "日付と時間帯を1つ以上追加してください"） */}
            {typeof errors.dateTimeSlots?.message === "string" && (
                <FieldError
                    errors={[{ message: errors.dateTimeSlots.message }]}
                />
            )}
        </div>
    );
}
