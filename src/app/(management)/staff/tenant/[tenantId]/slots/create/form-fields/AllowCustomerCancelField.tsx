"use client";

import { Controller } from "react-hook-form";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

type Props = {
    control: Control<FormValues>;
};

export function AllowCustomerCancelField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.cancellationPolicy.allowCustomerCancel"
            control={control}
            render={({ field, fieldState }) => (
                <Field
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                >
                    <FieldContent>
                        <FieldLabel>顧客キャンセル可</FieldLabel>
                        <FieldDescription>
                            OFFにするとお客様はキャンセルできません
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
