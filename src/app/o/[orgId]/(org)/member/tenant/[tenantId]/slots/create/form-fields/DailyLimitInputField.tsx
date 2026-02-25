"use client";

import { Controller } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";

type Props = {
    control: Control<FormValues>;
};

export function DailyLimitInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.dailyBookingLimit"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-daily-limit">
                        1日あたり予約上限
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-daily-limit"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        1日あたり、成立した予約が何件まで許容するか。0で無制限
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
