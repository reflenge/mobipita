"use client";

import { Controller } from "react-hook-form";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";

type Props = {
    control: Control<FormValues>;
};

export function AllowReschedulingField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.cancellationPolicy.allowRescheduling"
            control={control}
            render={({ field, fieldState }) => (
                <Field
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                >
                    <FieldContent>
                        <FieldLabel>日時変更（リスケジュール）可</FieldLabel>
                        <FieldDescription>
                            OFFにするとお客様は日時の変更ができません
                        </FieldDescription>
                    </FieldContent>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
