"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { Controller, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { FormValues } from "./schema";

type DateSlotTimeRangesProps = {
    dateIndex: number;
    control: React.ComponentProps<typeof Controller<FormValues>>["control"];
};

export function DateSlotTimeRanges({
    dateIndex,
    control,
}: DateSlotTimeRangesProps) {
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name: `dateTimeSlots.${dateIndex}.timeRanges`,
    });

    const addTimeRange = () => {
        append({ start: "09:00", end: "14:00" });
    };

    return (
        <div className="space-y-2">
            {fields.map((field, timeIndex) => (
                <div
                    key={field.id}
                    className="flex flex-wrap items-center gap-2"
                >
                    {timeIndex === 0 ? (
                        <Controller
                            name={`dateTimeSlots.${dateIndex}.date`}
                            control={control}
                            render={({ field: dateField }) => {
                                const dateObj = parseDateYYYYMMDD(
                                    dateField.value
                                );
                                return (
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
                                );
                            }}
                        />
                    ) : (
                        <span className="w-40" aria-hidden />
                    )}
                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.start`}
                        control={control}
                        render={({ field: startField }) => (
                            <Input
                                {...startField}
                                type="time"
                                className="w-28"
                                aria-label="開始時刻"
                            />
                        )}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Controller
                        name={`dateTimeSlots.${dateIndex}.timeRanges.${timeIndex}.end`}
                        control={control}
                        render={({ field: endField }) => (
                            <Input
                                {...endField}
                                type="time"
                                className="w-28"
                                aria-label="終了時刻"
                            />
                        )}
                    />
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
