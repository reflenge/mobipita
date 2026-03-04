"use client";

import { useFormContext } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** テナントのメールアドレス入力フィールド（任意） */
export function TenantEmailField() {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <Field>
            <FieldLabel>メールアドレス</FieldLabel>
            <Input
                {...register("email")}
                placeholder="example@tenant.com"
                type="email"
                aria-invalid={!!errors.email}
            />
            {errors.email && (
                <FieldError>{String(errors.email.message)}</FieldError>
            )}
        </Field>
    );
}
