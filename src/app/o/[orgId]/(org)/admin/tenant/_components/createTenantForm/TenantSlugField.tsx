"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CreateTenantFormValues } from "./schema";

const FORM_ID = "form-rhf-demo";

/** テナントスラッグ入力フィールド（英数字・ハイフン、先頭末尾は英字） */
export function TenantSlugField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="tenantSlug"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-tenant-slug`}>
                        テナントスラッグ
                    </FieldLabel>
                    <Input
                        {...field}
                        id={`${FORM_ID}-tenant-slug`}
                        aria-invalid={fieldState.invalid}
                        placeholder="cafe-kochi-ekimae"
                        autoComplete="off"
                    />
                    <FieldDescription>
                        英数字とハイフンのみ使用可能。先頭と末尾は英字にしてください。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
