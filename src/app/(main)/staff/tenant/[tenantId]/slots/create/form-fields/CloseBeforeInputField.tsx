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

export function CloseBeforeInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.acceptanceWindow.closeBeforeMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-close-before">
                        受付締切（開始何分前まで）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-close-before"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        予約の締め切り。180分 = 開始3時間前で受付終了
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
