"use client";

import { Controller, useFormContext } from "react-hook-form";
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
import type { CreateTenantFormValues } from "./schema";
import { tenantStatusOptions } from "./schema";

const FORM_ID = "form-rhf-demo";

/** テナント状態選択フィールド（準備中 / 公開中 / 一時停止 / 終了） */
export function TenantStatusField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="tenantStatus"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-tenant-status`}>
                        テナント状態
                    </FieldLabel>
                    <Select
                        value={field.value}
                        onValueChange={field.onChange}
                    >
                        <SelectTrigger
                            id={`${FORM_ID}-tenant-status`}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                        >
                            <SelectValue placeholder="状態を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {tenantStatusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldDescription>
                        作成時の運用状態を選択してください。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
