"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch"
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText
} from "@/components/ui/input-group"
import Tiptap from "@/components/Tiptap";
import CreateServiceSkeleton from "./createServiceSkeleton";

const formSchema = z.object({
    service: z.object({
        tenantId: z.string(),
        title: z.string()
            .min(1, "サービス名を入力してください")
            .min(5, "サービス名は5文字以上で入力してください")
            .max(100, "サービス名は100文字以内で入力してください"),
        description: z.string()
            .min(1, "サービス説明を入力してください")
            .min(20, "サービス説明は20文字以上で入力してください")
            .max(1000, "サービス説明は1000文字以内で入力してください"),
        isActive: z.boolean(),
    }),
})

type Props = {
    orgId: string;
    tenantId: string;
};


export function CreateService({ orgId, tenantId }: Props) {
    // テナント情報を取得
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });
    const createService = useMutation(api.services.create);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            service: {
                tenantId: tenantId,
                title: "",
                description: "<p></p>",
                isActive: true,
            },
        },
        mode: "all",
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await createService({
                    clerkOrgId: orgId,
                    tenantId: data.service.tenantId as Id<"Tenants">,
                    title: data.service.title,
                    description: data.service.description,
                    isActive: data.service.isActive,
                });
                toast.success("サービスを作成しました");
                startTransition(() => form.reset());
            } catch (err) {
                const message = err instanceof Error ? err.message : "サービスの作成に失敗しました";
                toast.error(message);
            }
        });
    }

    // tenant が取得できていない（undefined / null）の場合はローディング表示
    if (!tenant) {
        return <CreateServiceSkeleton />;
    }

    return (
        <div className="mx-auto container px-6 py-10 space-y-4">
            <div>
                <div className="text-xl">サービス作成</div>
                <p className="text-sm text-muted-foreground">
                    {tenant.tenantName} {tenant._id} のサービスを新規作成します
                </p>
            </div>
            <form id="form-slot-create" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    {/* テナントID */}
                    <Controller
                        name="service.tenantId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-slot-create-service-tenant-id">
                                    テナントID
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-slot-create-service-tenant-id"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="テナントIDを入力してください"
                                    autoComplete="off"
                                    disabled
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {/* サービス名 */}
                    <Controller
                        name="service.title"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-slot-create-service-title">
                                    サービス名
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-slot-create-service-title"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="サービス名を入力してください"
                                    autoComplete="off"
                                />
                                <FieldDescription>
                                    5文字以上100文字以内で入力してください。
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {/* サービス説明 */}
                    <Controller
                        name="service.description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-slot-create-service-description">
                                    サービス説明
                                </FieldLabel>
                                <InputGroup>
                                    <Tiptap
                                        sentence={field.value}
                                        setSentence={field.onChange}
                                        onBlur={field.onBlur}
                                        id="form-slot-create-service-description"
                                        aria-invalid={fieldState.invalid}
                                        className="min-h-48 max-h-96 overflow-y-auto w-full"
                                    />
                                    <InputGroupAddon align="block-end">
                                        <InputGroupText className="tabular-nums">
                                            {field.value.length}/1000 characters
                                        </InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                                <FieldDescription>
                                    装飾込みのHTMLで20文字以上1000文字以内で入力してください。
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {/* サービス有効化 */}
                    <Controller
                        name="service.isActive"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} orientation="horizontal">
                                <FieldContent>
                                    <FieldLabel htmlFor="form-slot-create-service-is-active">
                                        サービス有効化
                                    </FieldLabel>
                                    <FieldDescription>
                                        サービスを有効にする場合はチェックを入れてください。
                                    </FieldDescription>
                                </FieldContent>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="form-slot-create-service-is-active"
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </form>
            {/* ボタン */}
            <Field orientation="horizontal">
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                </Button>
                <Button type="submit" form="form-slot-create" disabled={isPending}>
                    {isPending ? "保存中..." : "Submit"}
                </Button>
            </Field>
        </div>
    );
}
