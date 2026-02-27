"use client";

import { Controller } from "react-hook-form";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
    control: Control<FormValues>;
};

export function ReminderInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.reminders.email.amountMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-reminder">
                        リマインダー送信（開始何分前）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-reminder"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        予約の何分前にリマインダーメールを送るか。1440分 = 1日前
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
