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

export function OpenBeforeInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.acceptanceWindow.openBeforeMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-open-before">
                        受付開始（開始何分前から）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-open-before"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        予約を受け付け始める時期。86400分 = 60日前から受付開始
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
