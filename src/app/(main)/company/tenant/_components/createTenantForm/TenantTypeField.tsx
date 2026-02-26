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
import { tenantTypeOptions } from "./schema";

const FORM_ID = "form-company-tenant-create";

/** テナント種別選択フィールド（直営 / テナント） */
export function TenantTypeField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="tenantType"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-tenant-type`}>
                        テナント種別
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id={`${FORM_ID}-tenant-type`}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                        >
                            <SelectValue placeholder="種別を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {tenantTypeOptions.map((option) => (
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
                        直営 or テナントを選択してください。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
