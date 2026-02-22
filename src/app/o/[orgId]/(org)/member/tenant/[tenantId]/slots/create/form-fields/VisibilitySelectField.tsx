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
};

export function VisibilitySelectField({ control }: Props) {
    return (
        <Controller
            name="slotTemplate.defaultVisibility"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-visibility">
                        表示
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id="form-slot-visibility"
                            aria-invalid={fieldState.invalid}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">公開</SelectItem>
                            <SelectItem value="unlisted">
                                非公開リスト
                            </SelectItem>
                            <SelectItem value="private">非公開</SelectItem>
                        </SelectContent>
                    </Select>
                    <FieldDescription>
                        公開=一覧に表示 /
                        非公開リスト=リンクを知っている人のみ /
                        非公開=一覧に表示しない
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
