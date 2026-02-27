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

export function DurationInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.durationMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-duration">
                        枠の長さ（分）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-duration"
                        type="number"
                        min={1}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        1枠あたりの長さ。例: 60 = 1時間
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
