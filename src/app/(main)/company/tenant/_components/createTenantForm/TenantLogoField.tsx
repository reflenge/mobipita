"use client";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { FilePond, registerPlugin } from "react-filepond";
import { Controller, useFormContext } from "react-hook-form";
import type { CreateTenantFormValues } from "./schema";
import type { FilePondFile } from "filepond";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";

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
                // RHF の値（File | null）を FilePond の files に渡す（Blob/File をそのまま配列で渡す）
                const files = field.value ? [field.value] : [];

                return (
                    <Field className="pt-6" data-invalid={fieldState.invalid}>
                        <FieldLabel>テナントアイコン画像</FieldLabel>
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
                            png / jpg / webp / gif / avif（最大 5MB）1枚
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
