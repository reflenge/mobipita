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

const FORM_ID = "form-admin-tenant-create";

/** 店舗ステータス選択フィールド（長期の店舗ライフサイクル） */
export function TenantStatusField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="tenantStatus"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-tenant-status`}>
                        店舗ステータス
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id={`${FORM_ID}-tenant-status`}
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                        >
                            <SelectValue placeholder="店舗ステータスを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {tenantStatusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    title={option.description}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldDescription>
                        長期の店舗ライフサイクル（恒常・中長期の状態）。店舗そのものが「事業として存在し、顧客を受け入れる体制か」を表します。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
