"use client";

import { Controller, useFormContext } from "react-hook-form";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import type { FilePondFile } from "filepond";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import type { CreateTenantFormValues } from "./schema";

// 画像プレビュー表示用プラグイン（1回だけ登録）
registerPlugin(FilePondPluginImagePreview);

/**
 * テナントロゴ画像フィールド（RHF + Zod のライフサイクル内）。
 * Controller でフォーム値（File | null）を FilePond と双方向に同期する。
 */
export function TenantLogoField() {
    const { control } = useFormContext<CreateTenantFormValues>();

    return (
        <Controller
            name="tenantLogo"
            control={control}
            render={({ field, fieldState }) => {
                // RHF の値（File | null）を FilePond の files 形式に変換
                const files = field.value
                    ? [{ source: field.value, options: { type: "local" } }]
                    : [];

                return (
                    <Field
                        className="pt-6"
                        data-invalid={fieldState.invalid}
                    >
                        <FieldLabel>テナント画像</FieldLabel>
                        <FilePond
                            key={field.value?.name ?? "empty"}
                            files={files}
                            onupdatefiles={(updated: FilePondFile[]) => {
                                const file = updated[0]?.file ?? null;
                                field.onChange(file);
                            }}
                            allowMultiple={false}
                            storeAsFile={true}
                            credits={false}
                            labelIdle='<span class="filepond--label-action">ファイル選択</span> または ドラッグ&ドロップ'
                        />
                        <FieldDescription>
                            png / jpg / webp / gif / avif（最大 5MB）
                        </FieldDescription>
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                );
            }}
        />
    );
}
