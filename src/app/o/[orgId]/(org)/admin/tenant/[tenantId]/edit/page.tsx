"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// 共通パーツのインポート
import { formSchema, type CreateTenantFormValues } from "../../_components/createTenantForm/schema";
import { TenantNameField } from "../../_components/createTenantForm/TenantNameField";
import { TenantSlugField } from "../../_components/createTenantForm/TenantSlugField";
import { TenantPhoneField } from "../../_components/createTenantForm/TenantPhoneField";
import { TenantTypeField } from "../../_components/createTenantForm/TenantTypeField";
import { TenantStatusField } from "../../_components/createTenantForm/TenantStatusField";
import { TenantStoreTypeField } from "../../_components/createTenantForm/TenantStoreTypeField";
import { TenantLogoField } from "../../_components/createTenantForm/TenantLogoField";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default function TenantEditPage({ params: paramsPromise }: PageProps) {
    const { orgId, tenantId } = React.use(paramsPromise);
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    const updateTenant = useMutation(api.tenants.update);

    const initialValues = React.useMemo((): CreateTenantFormValues | undefined => {
        if (!tenant) return undefined;
        return {
            tenantName: tenant.tenantName,
            tenantSlug: tenant.tenantSlug,
            phoneNumber: tenant.phoneNumber ?? "",
            tenantType: tenant.tenantType,
            tenantStatus: tenant.tenantStatus,
            storeType: tenant.storeType,
            tenantLogo: null, 
        };
    }, [tenant]);

    const form = useForm<CreateTenantFormValues>({
        resolver: zodResolver(formSchema),
        values: initialValues,
        resetOptions: { keepDirtyValues: true },
    });

    const onSubmit = async (values: CreateTenantFormValues) => {
        startTransition(async () => {
            try {
                // 修正：バックエンドの args に存在しない tenantLogo を除外する
                // また、現在の実装では logo のアップロード ID は既存のものを維持するか、
                // 別途アップロード処理が必要です。
                const { tenantLogo, ...updateData } = values;

                await updateTenant({
                    id: tenantId as Id<"Tenants">,
                    clerkOrgId: orgId,
                    ...updateData,
                    // tenantLogoFileId: 変更がある場合はここに新しい ID を渡す
                });
                
                toast.success("情報を更新しました");
                router.push(`/o/${orgId}/admin/tenant/${tenantId}`);
                router.refresh();
            } catch (error) {
                console.error("[UPDATE_ERROR]:", error);
                toast.error("更新に失敗しました。");
            }
        });
    };

    if (tenant === undefined) return <EditPageSkeleton />;
    if (tenant === null) return <NotFoundState onBack={() => router.back()} />;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">テナント情報の編集</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FieldGroup className="space-y-6">
                                
                                {/* 1. 基本情報 */}
                                <div className="space-y-4">
                                    <TenantNameField />
                                    <TenantSlugField />
                                    <TenantPhoneField />
                                </div>

                                {/* 2. タイプとステータス */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                    <TenantTypeField />
                                    <TenantStatusField />
                                </div>

                                {/* 3. 店舗種別 */}
                                <div className="pt-2">
                                    <TenantStoreTypeField />
                                </div>

                                {/* 4. ロゴ（一番下に配置） */}
                                <div className="pt-6 border-t space-y-3">
                                    <h3 className="text-sm font-medium">テナントアイコン</h3>
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20">
                                        <TenantLogoField />
                                        {tenant.tenantLogoFileId && !form.watch("tenantLogo") && (
                                            <p className="mt-2 text-[10px] text-muted-foreground font-mono">
                                                現在のロゴID: {tenant.tenantLogoFileId}
                                            </p>
                                        )}
                                    </div>
                                </div>

                            </FieldGroup>
                            
                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => router.back()}
                                    disabled={isPending}
                                >
                                    キャンセル
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isPending || !form.formState.isDirty}
                                >
                                    {isPending ? "保存中..." : "変更を保存"}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
}

// 補助コンポーネント（省略せず記載）
function EditPageSkeleton() {
    return (
        <div className="container mx-auto p-6 max-w-2xl space-y-6">
            <Skeleton className="h-8 w-48" />
            <Card className="p-10 space-y-6">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                <Skeleton className="h-32 w-full rounded-lg" />
            </Card>
        </div>
    );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
    return (
        <div className="container mx-auto p-6 text-center py-20">
            <p className="text-muted-foreground mb-4">テナントが見つかりません</p>
            <Button variant="outline" onClick={onBack}>一覧へ戻る</Button>
        </div>
    );
}