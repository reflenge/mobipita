"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { FileText, Info, Settings } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { TenantAddressField } from "../../_components/createTenantForm/TenantAddressField";
import { TenantEmailField } from "../../_components/createTenantForm/TenantEmailField";
import { TenantLogoField } from "../../_components/createTenantForm/TenantLogoField";
import { TenantNameField } from "../../_components/createTenantForm/TenantNameField";
import { TenantPhoneField } from "../../_components/createTenantForm/TenantPhoneField";
import { TenantStatusField } from "../../_components/createTenantForm/TenantStatusField";
import { TenantStoreTypeField } from "../../_components/createTenantForm/TenantStoreTypeField";
import { TenantTypeField } from "../../_components/createTenantForm/TenantTypeField";
import { formSchema } from "../../_components/createTenantForm/schema";
import type { CreateTenantFormValues } from "../../_components/createTenantForm/schema";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const FORM_ID = "form-company-tenant-edit";

export default function EditTenantPage() {
    const params = useParams<{ tenantId: string }>();
    const tenantId = params.tenantId as Id<"Tenants">;
    const tenant = useQuery(api.tenants.getById, { tenantId });

    if (tenant === undefined) {
        return (
            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
                <p className="text-muted-foreground">
                    テナントが見つかりません。
                </p>
                <Button asChild variant="outline">
                    <Link href="/m/company/tenant">一覧へ戻る</Link>
                </Button>
            </div>
        );
    }

    // tenant が確定してから Form をマウントすることで、
    // Select の defaultValues に実データを渡せる（条件付きレンダリングしないと
    // useForm の defaultValues が undefined → 後から変わるため Select の初期表示が空になる）
    return <EditTenantForm tenant={tenant} tenantId={tenantId} />;
}

type TenantData = NonNullable<ReturnType<typeof useQuery<typeof api.tenants.getById>>>;

function EditTenantForm({
    tenant,
    tenantId,
}: {
    tenant: TenantData;
    tenantId: Id<"Tenants">;
}) {
    const router = useRouter();
    const updateTenant = useMutation(api.tenants.update);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const updateFileStatus = useMutation(api.files.updateFileStatus);
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<CreateTenantFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tenantName: tenant.tenantName,
            tenantType: tenant.tenantType ?? "tenant",
            tenantStatus: tenant.tenantStatus ?? "preparing",
            storeType: tenant.storeType ?? "fixed",
            phoneNumber: tenant.phoneNumber ?? "",
            email: tenant.email ?? "",
            address: tenant.address ?? "",
            tenantLogo: null,
        },
        mode: "all",
    });

    async function onSubmit(data: CreateTenantFormValues) {
        startTransition(async () => {
            let uploadedFile: {
                storageId: Id<"_storage">;
                fileId: Id<"Files">;
            } | null = null;
            const imageFile = data.tenantLogo ?? null;

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
                await updateTenant({
                    id: tenantId,
                    tenantName: data.tenantName,
                    tenantType: data.tenantType,
                    tenantStatus: data.tenantStatus,
                    storeType: data.storeType,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    address: data.address,
                    tenantLogoFileId:
                        uploadedFile?.fileId ??
                        tenant?.tenantLogoFileId,
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

                toast("テナント情報を更新しました", {
                    position: "bottom-right",
                });
                router.push(`/m/company/tenant/${tenantId}`);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown error";
                toast("更新に失敗しました", {
                    description: message,
                    position: "bottom-right",
                });
            }
        });
    }

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">
                    テナント情報の編集
                </h1>
                <Button asChild variant="outline">
                    <Link href={`/m/company/tenant/${tenantId}`}>
                        戻る
                    </Link>
                </Button>
            </div>
            <Separator />

            <FormProvider {...form}>
                <form
                    id={FORM_ID}
                    onSubmit={form.handleSubmit((data) => {
                        void onSubmit(data);
                    })}
                    className="flex flex-col gap-6"
                >
                    {/* カード1: テナント識別情報 */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                            <h2 className="flex items-center gap-2 text-xl font-semibold">
                                <Info className="size-5 text-orange-500" />
                                テナント識別
                            </h2>
                        </div>
                        <div className="p-6">
                            <FieldGroup>
                                <TenantNameField />
                                <TenantLogoField />
                            </FieldGroup>
                        </div>
                    </section>

                    {/* カード2: 営業設定 */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                            <h2 className="flex items-center gap-2 text-xl font-semibold">
                                <Settings className="size-5 text-orange-500" />
                                営業設定
                            </h2>
                        </div>
                        <div className="p-6">
                            <FieldGroup>
                                <TenantTypeField />
                                <TenantStoreTypeField />
                                <TenantStatusField />
                            </FieldGroup>
                        </div>
                    </section>

                    {/* カード3: 連絡先・住所 */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                            <h2 className="flex items-center gap-2 text-xl font-semibold">
                                <FileText className="size-5 text-orange-500" />
                                連絡先・住所
                            </h2>
                        </div>
                        <div className="p-6">
                            <FieldGroup>
                                <TenantPhoneField />
                                <TenantEmailField />
                                <TenantAddressField />
                            </FieldGroup>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.push(
                                    `/m/company/tenant/${tenantId}`,
                                )
                            }
                        >
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? "保存中..." : "保存する"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
