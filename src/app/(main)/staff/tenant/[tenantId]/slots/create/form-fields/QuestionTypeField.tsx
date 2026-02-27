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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    control: Control<FormValues>;
    index: number;
};

export function QuestionTypeField({ control, index }: Props) {
    return (
        <Controller
            name={`slotTemplate.form.questions.${index}.type`}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>入力タイプ</FieldLabel>
                    <FieldDescription>
                        お客様が入力する形式（テキスト・電話番号・日付など）
                    </FieldDescription>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">テキスト</SelectItem>
                            <SelectItem value="textarea">長文</SelectItem>
                            <SelectItem value="tel">電話番号</SelectItem>
                            <SelectItem value="email">メール</SelectItem>
                            <SelectItem value="number">数値</SelectItem>
                            <SelectItem value="date">日付</SelectItem>
                            <SelectItem value="time">時刻</SelectItem>
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
