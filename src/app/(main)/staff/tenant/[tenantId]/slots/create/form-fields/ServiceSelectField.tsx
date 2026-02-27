"use client";

import { Controller } from "react-hook-form";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";
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

type Service = { _id: string; title: string };

type Props = {
    control: Control<FormValues>;
    options: Service[];
};

export function ServiceSelectField({ control, options }: Props) {
    return (
        <Controller
            name="slotTemplate.serviceId"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-create-service-id">
                        サービス
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id="form-slot-create-service-id"
                            aria-invalid={fieldState.invalid}
                            className="w-full max-w-xs"
                        >
                            <SelectValue placeholder="サービスを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((s) => (
                                <SelectItem key={s._id} value={s._id}>
                                    {s.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldDescription>
                        この予約枠を紐づけるサービスを選びます。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
