"use client";

import { Controller } from "react-hook-form";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";
import Tiptap from "@/components/Tiptap";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";

type Props = {
    control: Control<FormValues>;
    index: number;
};

export function QuestionLabelField({ control, index }: Props) {
    return (
        <Controller
            name={`slotTemplate.form.questions.${index}.label`}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>ラベル（表示文言）</FieldLabel>
                    <FieldDescription>
                        予約画面に表示する質問文。装飾（太字・リストなど）も可能です。
                    </FieldDescription>
                    <Tiptap
                        sentence={field.value}
                        setSentence={field.onChange}
                        onBlur={field.onBlur}
                        id={`form-slot-question-label-${index}`}
                        aria-invalid={fieldState.invalid}
                        className="max-h-48 min-h-24 w-full overflow-y-auto"
                    />
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
