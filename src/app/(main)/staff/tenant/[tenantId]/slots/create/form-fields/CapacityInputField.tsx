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

export function CapacityInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.defaultCapacity"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-capacity">
                        同時予約数
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-capacity"
                        type="number"
                        min={1}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        同じ枠に同時に何件まで予約できるか
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
