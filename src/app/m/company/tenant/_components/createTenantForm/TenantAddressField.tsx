"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** テナントの住所入力フィールド（任意・最大200文字） */
export function TenantAddressField() {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <Field>
            <FieldLabel>住所</FieldLabel>
            <Input
                {...register("address")}
                placeholder="東京都渋谷区..."
                type="text"
                aria-invalid={!!errors.address}
            />
            {errors.address && (
                <FieldError>{String(errors.address.message)}</FieldError>
            )}
        </Field>
    );
}
