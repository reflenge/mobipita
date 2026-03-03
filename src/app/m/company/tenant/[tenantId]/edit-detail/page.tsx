"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { TenantPhoneField } from "../../_components/createTenantForm/TenantPhoneField";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
        mode: "all",
    });

    const hasReset = React.useRef(false);
    React.useEffect(() => {
        if (tenant && !hasReset.current) {
            hasReset.current = true;
            form.reset({
                phoneNumber: tenant.phoneNumber ?? "",
            });
        }
    }, [tenant, form]);

    async function onSubmit(data: DetailFormValues) {
        startTransition(async () => {
            try {
                await updateDetail({
                    tenantId,
                    phoneNumber: data.phoneNumber,
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
            <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
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
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
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
                    <FieldGroup>
                        <TenantPhoneField />
                    </FieldGroup>
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
