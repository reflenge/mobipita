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

type Location = { _id: string; name: string };

type Props = {
    control: Control<FormValues>;
    options: Location[];
};

export function LocationSelectField({ control, options }: Props) {
    return (
        <Controller
            name="slotTemplate.defaultLocationId"
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-slot-create-location-id">
                        デフォルトの場所
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id="form-slot-create-location-id"
                            aria-invalid={fieldState.invalid}
                            className="w-full max-w-xs"
                        >
                            <SelectValue placeholder="場所を選択" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((loc) => (
                                <SelectItem key={loc._id} value={loc._id}>
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldDescription>
                        時間帯ごとに場所を指定しない場合、この場所が使われます。
                        固定店舗の場合はここを設定するだけでよい。
                    </FieldDescription>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
