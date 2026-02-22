"use client";

import {
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field";
import { CancelDeadlineInputField } from "./CancelDeadlineInputField";
import { RescheduleDeadlineInputField } from "./RescheduleDeadlineInputField";
import { AllowCustomerCancelField } from "./AllowCustomerCancelField";
import { AllowReschedulingField } from "./AllowReschedulingField";
import type { FormValues } from "../schema";
import type { Control } from "react-hook-form";

type Props = {
    control: Control<FormValues>;
};

export function CancellationPolicySection({ control }: Props) {
    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div>
                <FieldLabel>キャンセル・変更ポリシー</FieldLabel>
                <FieldDescription>
                    キャンセル・日時変更のルールを設定します。
                </FieldDescription>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CancelDeadlineInputField control={control} />
                <RescheduleDeadlineInputField control={control} />
            </div>
            <div className="flex flex-wrap gap-6">
                <AllowCustomerCancelField control={control} />
                <AllowReschedulingField control={control} />
            </div>
        </div>
    );
}
