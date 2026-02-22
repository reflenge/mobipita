"use client";

import { Controller } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from "@/components/ui/input-group";
import Tiptap from "@/components/Tiptap";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";

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
                    <InputGroup>
                        <Tiptap
                            sentence={field.value}
                            setSentence={field.onChange}
                            onBlur={field.onBlur}
                            id={`form-slot-question-label-${index}`}
                            aria-invalid={fieldState.invalid}
                            className="min-h-24 max-h-48 overflow-y-auto w-full"
                        />
                        <InputGroupAddon align="block-end">
                            <InputGroupText className="tabular-nums">
                                {field.value.length} 文字
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
