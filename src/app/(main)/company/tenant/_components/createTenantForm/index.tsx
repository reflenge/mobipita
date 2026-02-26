"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { FieldGroup } from "@/components/ui/field";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

import { formSchema, type CreateTenantFormValues } from "./schema";
import { TenantNameField } from "./TenantNameField";
import { TenantTypeField } from "./TenantTypeField";
import { TenantStatusField } from "./TenantStatusField";
import { TenantStoreTypeField } from "./TenantStoreTypeField";
import { TenantLogoField } from "./TenantLogoField";
import { CreateTenantFormActions } from "./CreateTenantFormActions";

/** フォーム要素の id に使う文字列（送信ボタンの form 属性と一致させる） */
const FORM_ID = "form-admin-tenant-create";

/**
 * テナント作成フォーム本体。
 * FormProvider で子コンポーネントにフォームコンテキストを渡し、
 * 送信時は画像アップロード → テナント作成 → 詳細ページへ遷移を行う。
 */
export default function CreateTenantForm() {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const updateFileStatus = useMutation(api.files.updateFileStatus);
    const createTenant = useMutation(api.tenants.create);

    const form = useForm<CreateTenantFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tenantName: "",
            tenantType: "tenant",
            tenantStatus: "preparing",
            storeType: "fixed",
            tenantLogo: null,
        },
        mode: "all", // 入力・blur などすべてのタイミングでバリデーション
    });

    const handleReset = React.useCallback(() => {
        form.reset({
            tenantName: "",
            tenantType: "tenant",
            tenantStatus: "preparing",
            storeType: "fixed",
            tenantLogo: null,
        });
    }, [form]);

    /** 送信処理: 画像アップロード（任意・Zod 検証済み） → テナント作成 → 詳細ページへ遷移 */
    async function onSubmit(data: CreateTenantFormValues) {
        startTransition(async () => {
            let uploadedFile: {
                storageId: Id<"_storage">;
                fileId: Id<"Files">;
            } | null = null;
            const imageFile = data.tenantLogo ?? null;

            // 画像が選択されている場合のみアップロード（Zod でサイズ・形式は検証済み）
            if (imageFile) {
                try {
                    const uploadUrl = await generateUploadUrl();
                    const res = await fetch(uploadUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": imageFile.type,
                        },
                        body: imageFile,
                    });

                    if (!res.ok) {
                        throw new Error(
                            `Upload failed: ${res.status} ${res.statusText}`,
                        );
                    }

                    const json = (await res.json()) as {
                        storageId: Id<"_storage">;
                    };
                    const storageId = json.storageId;
                    const fileId = await saveFile({
                        storageId,
                        fileName: imageFile.name,
                        contentType: imageFile.type,
                        size: imageFile.size,
                    });

                    uploadedFile = { storageId, fileId };
                } catch (e) {
                    const message =
                        e instanceof Error ? e.message : "Unknown error";
                    toast("画像アップロードに失敗しました", {
                        description: message,
                        position: "bottom-right",
                    });
                    return;
                }
            }

            try {
                const tenantId = await createTenant({
                    tenantName: data.tenantName,
                    tenantType: data.tenantType,
                    tenantStatus: data.tenantStatus,
                    storeType: data.storeType,
                    tenantLogoFileId: uploadedFile?.fileId,
                });

                if (uploadedFile) {
                    try {
                        await updateFileStatus({
                            fileId: uploadedFile.fileId,
                            status: "attached",
                        });
                    } catch (error) {
                        const message =
                            error instanceof Error
                                ? error.message
                                : "Unknown error";
                        toast("ファイルの紐付けに失敗しました", {
                            description: message,
                            position: "bottom-right",
                        });
                    }
                }

                router.push(`/company/tenant/${tenantId}`);
                form.reset();
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Unknown error";
                toast("テナント作成に失敗しました", {
                    description: message,
                    position: "bottom-right",
                });
            }
        });
    }

    return (
        <div className="container mx-auto flex w-full flex-col gap-6 p-6">
            <FormProvider {...form}>
                <form
                    id={FORM_ID}
                    onSubmit={form.handleSubmit((data) => {
                        void onSubmit(data);
                    })}
                >
                    <FieldGroup>
                        <TenantNameField />
                        <TenantTypeField />
                        <TenantStatusField />
                        <TenantStoreTypeField />
                    </FieldGroup>
                    <FieldGroup>
                        {/* ロゴは RHF の tenantLogo（File | null）で管理し、Zod で検証 */}
                        <TenantLogoField />
                    </FieldGroup>
                </form>
                <CreateTenantFormActions
                    isPending={isPending}
                    onReset={handleReset}
                />
            </FormProvider>
        </div>
    );
}
