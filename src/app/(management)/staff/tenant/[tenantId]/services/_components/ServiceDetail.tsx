"use client";

import { useEffect, useState } from "react";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import Tiptap from "@/components/Tiptap";
import { TiptapViewer } from "@/components/Tiptap/viewer";
import { Link } from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    title: z
        .string()
        .min(1, "サービス名を入力してください")
        .min(5, "サービス名は5文字以上で入力してください")
        .max(100, "サービス名は100文字以内で入力してください"),
    description: z
        .string()
        .min(1, "サービス説明を入力してください")
        .min(20, "サービス説明は20文字以上で入力してください")
        .max(1000, "サービス説明は1000文字以内で入力してください"),
    isActive: z.boolean(),
});

type ServiceDetailProps = {
    tenantId: string;
    serviceId: string;
};

export function ServiceDetail({ tenantId, serviceId }: ServiceDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const service = useQuery(api.services.getById, {
        serviceId: serviceId as Id<"Services">,
    });
    const updateService = useMutation(api.services.update);
    const removeService = useMutation(api.services.remove);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            isActive: true,
        },
        mode: "all",
    });

    useEffect(() => {
        if (service && isEditing) {
            form.reset({
                title: service.title,
                description: service.description,
                isActive: service.isActive,
            });
        }
    }, [service, isEditing, form]);

    function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await updateService({
                    serviceId: serviceId as Id<"Services">,
                    title: data.title,
                    description: data.description,
                    isActive: data.isActive,
                });
                toast.success("サービスを更新しました");
                setIsEditing(false);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "サービスの更新に失敗しました";
                toast.error(message);
            }
        });
    }

    async function handleDelete() {
        if (
            !window.confirm(
                `「${service?.title}」を削除しますか？この操作は取り消せません。`,
            )
        ) {
            return;
        }
        setIsDeleting(true);
        try {
            await removeService({
                serviceId: serviceId as Id<"Services">,
            });
            toast.success("サービスを削除しました");
            router.push(`/staff/tenant/${tenantId}/services`);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "サービスの削除に失敗しました";
            toast.error(message);
            setIsDeleting(false);
        }
    }

    if (service === undefined) {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (service === null) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>サービスが見つかりません</CardTitle>
                    <CardDescription>
                        指定されたサービスは存在しないか、アクセスできません。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={`/staff/tenant/${tenantId}/services`}>
                        <Button variant="outline">サービス一覧へ</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (isEditing) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle>サービスを編集</CardTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                    >
                        キャンセル
                    </Button>
                </CardHeader>
                <CardContent>
                    <form
                        id="form-service-edit"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FieldGroup>
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>サービス名</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="サービス名を入力してください"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>
                                            5文字以上100文字以内で入力してください。
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>サービス説明</FieldLabel>
                                        <Tiptap
                                            sentence={field.value}
                                            setSentence={field.onChange}
                                            onBlur={field.onBlur}
                                            maxLength={1000}
                                            aria-invalid={fieldState.invalid}
                                            className="max-h-96 min-h-48 w-full overflow-y-auto"
                                        />
                                        <FieldDescription>
                                            装飾込みのHTMLで20文字以上1000文字以内で入力してください。
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="isActive"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        orientation="horizontal"
                                    >
                                        <FieldContent>
                                            <FieldLabel>
                                                サービス有効化
                                            </FieldLabel>
                                            <FieldDescription>
                                                サービスを有効にする場合はチェックを入れてください。
                                            </FieldDescription>
                                        </FieldContent>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <Field orientation="horizontal" className="gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="submit"
                                form="form-service-edit"
                                disabled={isPending}
                            >
                                {isPending ? "保存中..." : "保存する"}
                            </Button>
                        </Field>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <CardTitle className="text-2xl">
                            {service.title}
                        </CardTitle>
                        <Badge
                            variant={service.isActive ? "default" : "secondary"}
                        >
                            {service.isActive ? "有効" : "無効"}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            編集
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            {isDeleting ? "削除中..." : "削除"}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                        説明
                    </h3>
                    <TiptapViewer content={service.description} />
                </div>
            </CardContent>
        </Card>
    );
}
