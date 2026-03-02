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

export function RescheduleDeadlineInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.cancellationPolicy.rescheduleDeadlineMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-reschedule-deadline">
                        変更期限（開始何分前まで）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-reschedule-deadline"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        日時変更（リスケ）できる期限。120 = 開始2時間前まで
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
