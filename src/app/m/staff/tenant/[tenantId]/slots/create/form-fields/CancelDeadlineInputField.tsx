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

export function CancelDeadlineInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.cancellationPolicy.cancelDeadlineMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-cancel-deadline">
                        キャンセル期限（開始何分前まで）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-cancel-deadline"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        お客様がキャンセルできる期限。60 = 開始1時間前まで
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
