// Next.js のクライアントコンポーネントとして実行するための宣言
"use client";

// React と各種フォーム/バリデーション関連の依存を読み込み
import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useMutation } from "convex/react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import type { ActualFileObject, FilePondFile } from "filepond";
import { Spinner } from "@/components/ui/spinner"

// UI コンポーネント群（アプリ内の共通デザインシステム）
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

registerPlugin(FilePondPluginImagePreview);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
];
const tenantTypeOptions = [
    { value: "tenant", label: "テナント" },
    { value: "direct", label: "直営" },
];
const tenantStatusOptions = [
    { value: "preparing", label: "準備中" },
    { value: "open", label: "公開中" },
    { value: "paused", label: "一時停止" },
    { value: "closed", label: "終了" },
];

// フォームの入力値とバリデーションルールを Zod で定義
const formSchema = z.object({
    // テナント名: 5〜32文字に制限
    tenantName: z
        .string()
        .min(5, "テナント名は5文字以上で入力してください。")
        .max(32, "テナント名は32文字以内で入力してください。"),
    // テナントスラッグ: 英数字とハイフンのみ、先頭末尾は英字
    tenantSlug: z
        .string()
        .min(5, "テナントスラッグは5文字以上で入力してください。")
        .max(32, "テナントスラッグは32文字以内で入力してください。")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z]$/,
            "テナントスラッグは英数字とハイフンのみで、先頭と末尾は英字にしてください。",
        ),
    // テナント種別
    tenantType: z.enum(["direct", "tenant"]),
    // テナントの運用状態
    tenantStatus: z.enum(["preparing", "open", "paused", "closed"]),
});

type CreateTenantFormProps = {
    org: {
        id: string;
        name: string;
    };
};

const CreateTenantForm = ({ org }: CreateTenantFormProps) => {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveFile = useMutation(api.files.saveFile);
    const updateFileStatus = useMutation(api.files.updateFileStatus);
    const createTenant = useMutation(api.tenants.create);
    const isLoading = isPending || isSubmitting;

    // React Hook Form を初期化し、Zod のスキーマでバリデーションを行う
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // 初期値（未入力状態）
        defaultValues: {
            tenantName: "",
            tenantSlug: "",
            tenantType: "tenant",
            tenantStatus: "preparing",
        },
        mode: "all", // すべてのイベントでバリデーションを実行
    });

    const [files, setFiles] = React.useState<ActualFileObject[]>([]);
    const [uploadResult, setUploadResult] = React.useState<
        | { ok: true; storageId: Id<"_storage">; fileId: Id<"Files"> }
        | { ok: false; message: string }
        | null
    >(null);

    async function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(() => {
            setIsSubmitting(true);
        });
        setUploadResult(null);

        try {
            let uploadedFile: {
                storageId: Id<"_storage">;
                fileId: Id<"Files">;
            } | null = null;
        const imageFile = files[0];

            if (imageFile) {
                if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
                    toast("画像形式が正しくありません", {
                        description: "対応形式: jpeg / png / webp / gif / avif",
                        position: "bottom-right",
                    });
                    return;
                }

                if (imageFile.size > MAX_FILE_SIZE) {
                    toast("画像サイズが大きすぎます", {
                        description: "5MB 以下の画像を選択してください。",
                        position: "bottom-right",
                    });
                    return;
                }

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
                    setUploadResult({ ok: true, storageId, fileId });
                } catch (e) {
                    const message =
                        e instanceof Error ? e.message : "Unknown error";
                    setUploadResult({ ok: false, message });
                    toast("画像アップロードに失敗しました", {
                        description: message,
                        position: "bottom-right",
                    });
                    return;
                }
            }

            try {
                const tenantId = await createTenant({
                    clerkOrgId: org.id,
                    tenantName: data.tenantName,
                    tenantSlug: data.tenantSlug,
                    tenantType: data.tenantType,
                    tenantStatus: data.tenantStatus,
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

                // toast("テナントを作成しました", {
                //     description: (
                //         <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
                //             <code>
                //                 {JSON.stringify(
                //                     {
                //                         tenantId,
                //                         tenantName: data.tenantName,
                //                         tenantSlug: data.tenantSlug,
                //                         tenantType: data.tenantType,
                //                         tenantStatus: data.tenantStatus,
                //                         tenantLogoFileId:
                //                             uploadedFile?.fileId ?? null,
                //                     },
                //                     null,
                //                     2,
                //                 )}
                //             </code>
                //         </pre>
                //     ),
                //     position: "bottom-right",
                //     classNames: {
                //         content: "flex flex-col gap-2",
                //     },
                //     style: {
                //         "--border-radius": "calc(var(--radius)  + 4px)",
                //     } as React.CSSProperties,
                // });

                router.push(`/o/${org.id}/admin/tenant/${tenantId}`);

                form.reset();
                setFiles([]);
                setUploadResult(null);
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Unknown error";
                toast("テナント作成に失敗しました", {
                    description: message,
                    position: "bottom-right",
                });
            }
        } finally {
            startTransition(() => {
                setIsSubmitting(false);
            });
        }
    }

    // 画面描画: カード内にフォームを構成
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 ">
            {/* RHF の submit ハンドラに接続 */}
            <form
                id="form-rhf-demo"
                onSubmit={form.handleSubmit((data) => {
                    startTransition(() => {
                        void onSubmit(data);
                    });
                })}
            >
                {/* フィールド群を縦方向にまとめる */}
                <FieldGroup>
                    {/* タイトル入力: Controller で RHF と UI を接続 */}
                    <Controller
                        name="tenantName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            // data-invalid はデザイン側でのエラースタイル用
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-tenant-name">
                                    テナント名
                                </FieldLabel>
                                {/* Text input に RHF の field を展開 */}
                                <Input
                                    {...field}
                                    id="form-rhf-demo-tenant-name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="カフェ高知駅前店"
                                    autoComplete="off"
                                />
                                {/* バリデーションエラーがある場合のみ表示 */}
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {/* テナントスラッグ入力 */}
                    <Controller
                        name="tenantSlug"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-tenant-slug">
                                    テナントスラッグ
                                </FieldLabel>
                                {/* 入力のガイド文 */}
                                <Input
                                    {...field}
                                    id="form-rhf-demo-tenant-slug"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="cafe-kochi-ekimae"
                                    autoComplete="off"
                                />
                                <FieldDescription>
                                    英数字とハイフンのみ使用可能。先頭と末尾は英字にしてください。
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    {/* テナント概要入力: テキストエリア＋文字数カウント */}
                    <Controller
                        name="tenantType"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-tenant-type">
                                    テナント種別
                                </FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="form-rhf-demo-tenant-type"
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="種別を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenantTypeOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    直営 or テナントを選択してください。
                                </FieldDescription>
                                {/* バリデーションエラーがある場合のみ表示 */}
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <Controller
                        name="tenantStatus"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-tenant-status">
                                    テナント状態
                                </FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="form-rhf-demo-tenant-status"
                                        aria-invalid={fieldState.invalid}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="状態を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenantStatusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    作成時の運用状態を選択してください。
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Field className="pt-6">
                        <FieldLabel>テナント画像</FieldLabel>
                        <FilePond
                            files={files}
                            onupdatefiles={(updatedFiles: FilePondFile[]) => {
                                setFiles(
                                    updatedFiles.map((fileItem) => fileItem.file),
                                );
                                setUploadResult(null);
                            }}
                            allowMultiple={false}
                            storeAsFile={true}
                            credits={false}
                            labelIdle='<span class="filepond--label-action">ファイル選択</span> または ドラッグ&ドロップ'
                        />
                        <FieldDescription>
                            png / jpg / webp / gif / avif（最大 5MB）
                        </FieldDescription>
                        {uploadResult?.ok && (
                            <p className="m-0 text-sm text-emerald-700">
                                ✅ 画像を保存しました（fileId:{" "}
                                <code>{uploadResult.fileId}</code> / storageId:{" "}
                                <code>{uploadResult.storageId}</code>）
                            </p>
                        )}
                        {uploadResult && !uploadResult.ok && (
                            <p className="m-0 text-sm text-red-600">
                                ❌ {uploadResult.message}
                            </p>
                        )}
                    </Field>
                </FieldGroup>
            </form>
            {/* フッター: リセットと送信ボタンを横並び */}
            <Field orientation="horizontal">
                {/* クリックでフォームを初期状態に戻す */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        form.reset();
                        setFiles([]);
                        setUploadResult(null);
                    }}
                >
                    リセット
                </Button>
                {/* form 属性で外側の form と紐づけて送信 */}
                <Button type="submit" form="form-rhf-demo" disabled={isLoading}>
                    {isLoading ? (<><Spinner />作成中...</>) : "作成する"}
                </Button>
            </Field>
        </div>
    );
};
export default CreateTenantForm;
