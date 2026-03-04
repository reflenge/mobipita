"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { FileText, MapPin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { TenantAddressField } from "../../_components/createTenantForm/TenantAddressField";
import { TenantEmailField } from "../../_components/createTenantForm/TenantEmailField";
import { TenantPhoneField } from "../../_components/createTenantForm/TenantPhoneField";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/** 詳細情報編集フォームのバリデーションスキーマ（電話番号・メール・住所） */
const detailFormSchema = z.object({
    phoneNumber: z
        .string()
        .regex(
            /^[0-9-]*$/,
            "電話番号は数字とハイフンのみで入力してください",
        )
        .max(20, "20文字以内で入力してください")
        .transform((val) => (val === "" ? undefined : val))
        .optional(),
    /** メールアドレス（任意・空文字列も許容） */
    email: z
        .string()
        .email("有効なメールアドレスを入力してください")
        .max(254, "254文字以内で入力してください")
        .transform((val) => (val === "" ? undefined : val))
        .optional()
        .or(z.literal("")),
    /** 住所（任意・最大200文字） */
    address: z
        .string()
        .max(200, "200文字以内で入力してください")
        .transform((val) => (val === "" ? undefined : val))
        .optional(),
});

type DetailFormValues = z.infer<typeof detailFormSchema>;

export default function EditTenantDetailPage() {
    const router = useRouter();
    const params = useParams<{ tenantId: string }>();
    const tenantId = params.tenantId as Id<"Tenants">;
    const tenant = useQuery(api.tenants.getById, { tenantId });
    const updateDetail = useMutation(api.tenants.updateDetail);
    const [isPending, startTransition] = React.useTransition();

    const form = useForm<DetailFormValues>({
        resolver: zodResolver(detailFormSchema),
        defaultValues: {
            phoneNumber: "",
        },
        values: tenant
            ? {
                  phoneNumber: tenant.phoneNumber ?? "",
                  email: tenant.email ?? "",
                  address: tenant.address ?? "",
              }
            : undefined,
        mode: "all",
    });

    async function onSubmit(data: DetailFormValues) {
        startTransition(async () => {
            try {
                await updateDetail({
                    tenantId,
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    address: data.address,
                });
                toast("詳細情報を更新しました", {
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

    if (tenant === undefined) {
        return (
            <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
                <Skeleton className="h-8 w-48" />
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

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">
                    詳細情報の編集
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
                    onSubmit={form.handleSubmit((data) => {
                        void onSubmit(data);
                    })}
                    className="flex flex-col gap-6"
                >
                    {/* ── カード: 連絡先 ── */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                            <h2 className="flex items-center gap-2 text-xl font-semibold">
                                <FileText className="size-5 text-orange-500" />
                                連絡先
                            </h2>
                        </div>
                        <div className="p-6">
                            <FieldGroup>
                                <TenantPhoneField />
                                <TenantEmailField />
                            </FieldGroup>
                        </div>
                    </section>

                    {/* ── カード: 住所 ── */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                            <h2 className="flex items-center gap-2 text-xl font-semibold">
                                <MapPin className="size-5 text-orange-500" />
                                住所
                            </h2>
                        </div>
                        <div className="p-6">
                            <FieldGroup>
                                <TenantAddressField />
                            </FieldGroup>
                        </div>
                    </section>

                    {/* 注意テキスト */}
                    <p className="text-sm text-slate-500">
                        ※ 連絡先情報を更新すると、システムからの通知先が変更されます。お間違えのないようご確認ください。
                    </p>

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
