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

/** テナントスラッグ（一時的に自動採番・入力不可。UUID v4 ベース） */
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
                        readOnly
                        disabled
                        className="bg-muted"
                        autoComplete="off"
                    />
                    <FieldDescription>
                        一時的に自動採番（UUID v4）です。リセットで新しい値に変わります。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
