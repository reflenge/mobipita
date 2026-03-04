"use client";

import { useFormContext } from "react-hook-form";
// エラーに基づき、プロパティを持たない「箱」としてのFieldを想定
import { Field, FieldLabel, FieldError } from "@/components/ui/field"; 
import { Input } from "@/components/ui/input";
import type { CreateTenantFormValues } from "./schema";

export function TenantPhoneField() {
    const {
        register,
        formState: { errors },
    } = useFormContext<CreateTenantFormValues>();

    return (
        <Field>
            <FieldLabel>電話番号</FieldLabel>
            <Input
                {...register("phoneNumber")}
                placeholder="03-1234-5678"
                type="tel"
                // エラーがある場合にアクセシビリティを向上させる属性（脆弱性・品質対策）
                aria-invalid={!!errors.phoneNumber}
            />
            {/* エラーが存在する場合のみ表示 */}
            {errors.phoneNumber && (
                <FieldError>{errors.phoneNumber.message}</FieldError>
            )}
        </Field>
    );
}