"use client";

import { useFieldArray } from "react-hook-form";
import { QuestionLabelField } from "./QuestionLabelField";
import { QuestionRequiredField } from "./QuestionRequiredField";
import { QuestionTypeField } from "./QuestionTypeField";
import type { FormValues } from "../schema";
import type { UseFormRegister } from "react-hook-form";
import type { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldLabel } from "@/components/ui/field";

type Props = {
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
};

export function FormQuestionsSection({ control, register }: Props) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "slotTemplate.form.questions",
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <FieldLabel>予約時に聞く質問</FieldLabel>
                    <FieldDescription>
                        予約フォームでお客様に聞く項目を追加できます。お名前・電話番号・備考など。
                    </FieldDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        append({
                            id: `q_${Date.now()}`,
                            label: "<p></p>",
                            type: "text",
                            required: false,
                        })
                    }
                >
                    質問を追加
                </Button>
            </div>
            {fields.map((fieldItem, index) => (
                <div
                    key={fieldItem.id}
                    className="space-y-3 rounded-lg border p-4"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                            質問 {index + 1}
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                        >
                            削除
                        </Button>
                    </div>
                    <input
                        type="hidden"
                        {...register(`slotTemplate.form.questions.${index}.id`)}
                    />
                    <QuestionLabelField control={control} index={index} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <QuestionTypeField control={control} index={index} />
                        <QuestionRequiredField
                            control={control}
                            index={index}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
