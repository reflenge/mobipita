"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CreateTenantFormValues } from "./schema";

/** フォーム要素と紐づけるための ID プレフィックス */
const FORM_ID = "form-rhf-demo";

/** テナント名入力フィールド（5〜32文字） */
export function TenantNameField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="tenantName"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-tenant-name`}>
                        テナント名
                    </FieldLabel>
                    <Input
                        {...field}
                        id={`${FORM_ID}-tenant-name`}
                        aria-invalid={fieldState.invalid}
                        placeholder="カフェ高知駅前店"
                        autoComplete="off"
                    />
                    {/* バリデーションエラー時のみメッセージ表示 */}
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
