"use client";

import { Controller, useFormContext } from "react-hook-form";
import { storeTypeOptions } from "./schema";
import type { CreateTenantFormValues } from "./schema";
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

const FORM_ID = "form-company-tenant-create";

/** 店舗形態選択フィールド（移動店舗 / 固定店舗） */
export function TenantStoreTypeField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="storeType"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-store-type`}>
                        店舗形態
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id={`${FORM_ID}-store-type`}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                        >
                            <SelectValue placeholder="移動店舗 or 固定店舗を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {storeTypeOptions.map((option) => (
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
                        移動店舗 or 固定店舗を選択してください。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
