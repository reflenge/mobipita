"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    MapCoordinatePicker,
    MapCoordinatePickerProvider,
} from "@/components/map/pic";
import { Switch } from "@/components/ui/switch"
import { useQuery } from "convex/react";
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
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import Tiptap from "@/components/Tiptap";

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


export function MemberSlotCreateContent({ orgId, tenantId }: Props) {
    // テナント情報を取得
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    // 地図から逆ジオコーディングで取得した住所（ユーザー編集不可）
    const [coordinates, setCoordinates] = React.useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            service: {
                tenantId: tenantId,
                title: "testtesttest",
                description: "<p>testtesttesttest</p>",
                isActive: true,
            },
        },
        mode: "all",
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log("🚀 => onSubmit => data:", data)
        toast(
            <pre className="bg-code text-code-foreground w-[520px] overflow-x-auto">
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>)
    }



    // tenant が取得できていない（undefined / null）の場合はローディング表示
    if (!tenant) {
        return (
            <div className="mx-auto container px-6 py-10">
                <Card>
                    <CardHeader className="gap-3">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto container px-6 py-10 space-y-4">
            <div>
                <div className="text-xl">予約枠作成</div>
                <p className="text-sm text-muted-foreground">
                    {tenant.tenantName} {tenant._id} の予約枠を新規作成します
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
                <Button type="submit" form="form-slot-create">
                    Submit
                </Button>
            </Field>
        </div>
    );
}
