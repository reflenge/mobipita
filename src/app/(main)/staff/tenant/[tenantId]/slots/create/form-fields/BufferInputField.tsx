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

export function BufferInputField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.bufferMinutes"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-buffer">
                        枠間バッファ（分）
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-slot-buffer"
                        type="number"
                        min={0}
                        onChange={(e) =>
                            field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                        連続する枠の間に設ける休憩時間。例: 30 =
                        枠と枠の間に30分空ける
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
