"use client";

import { Controller } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";

type Props = {
    control: Control<FormValues>;
    index: number;
};

export function QuestionRequiredField({ control, index }: Props) {
    return (
        <Controller
            name={`slotTemplate.form.questions.${index}.required`}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>必須 / 任意</FieldLabel>
                    <FieldDescription>この質問が必須か任意か</FieldDescription>
                    <Select
                        value={field.value ? "required" : "optional"}
                        onValueChange={(v) => field.onChange(v === "required")}
                    >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="required">必須</SelectItem>
                            <SelectItem value="optional">任意</SelectItem>
                        </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
