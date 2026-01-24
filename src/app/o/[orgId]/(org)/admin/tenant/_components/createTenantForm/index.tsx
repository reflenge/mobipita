// Next.js のクライアントコンポーネントとして実行するための宣言
"use client";

// React と各種フォーム/バリデーション関連の依存を読み込み
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useMutation } from "convex/react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import type { FilePondFile } from "filepond";

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
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group";
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
    // テナント概要: 20〜100文字に制限
    tenantBio: z
        .string()
        .min(20, "テナント概要は20文字以上で入力してください。")
        .max(100, "テナント概要は100文字以内で入力してください。"),
});

const CreateTenantForm = () => {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveImage = useMutation(api.files.saveImage);

    // React Hook Form を初期化し、Zod のスキーマでバリデーションを行う
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // 初期値（未入力状態）
        defaultValues: {
            tenantName: "",
            tenantSlug: "",
            tenantBio: "",
        },
        mode: "all", // すべてのイベントでバリデーションを実行
    });

    const [files, setFiles] = React.useState<FilePondFile[]>([]);
    const [uploadResult, setUploadResult] = React.useState<
        | { ok: true; storageId: Id<"_storage"> }
        | { ok: false; message: string }
        | null
    >(null);

    // 送信時の処理: 画像アップロード後に入力値をトーストで表示（デモ用途）
    async function onSubmit(data: z.infer<typeof formSchema>) {
        setUploadResult(null);

        let storageId: Id<"_storage"> | null = null;
        const imageFile = files[0]?.file;

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
                storageId = json.storageId;

                await saveImage({
                    storageId,
                    fileName: imageFile.name,
                    contentType: imageFile.type,
                    size: imageFile.size,
                });

                setUploadResult({ ok: true, storageId });
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unknown error";
                setUploadResult({ ok: false, message });
                toast("画像アップロードに失敗しました", {
                    description: message,
                    position: "bottom-right",
                });
                return;
            }
        }

        toast("以下の内容で送信しました:", {
            // 入力値を整形して表示するためのコードブロック
            description: (
                <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
                    <code>
                        {JSON.stringify(
                            {
                                ...data,
                                tenantImageStorageId: storageId ?? null,
                            },
                            null,
                            2,
                        )}
                    </code>
                </pre>
            ),
            // 画面右下に表示
            position: "bottom-right",
            classNames: {
                // トースト内のレイアウトを縦並びにする
                content: "flex flex-col gap-2",
            },
            style: {
                // デザインシステムの角丸に少し余白を加えた見た目
                "--border-radius": "calc(var(--radius)  + 4px)",
            } as React.CSSProperties,
        });

        form.reset();
        setFiles([]);
    }

    // 画面描画: カード内にフォームを構成
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 ">
            {/* RHF の submit ハンドラに接続 */}
            <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
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
                                    placeholder="株式会社モビピタ"
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
                                    placeholder="mobipita"
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
                        name="tenantBio"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-demo-tenant-bio">
                                    テナント概要
                                </FieldLabel>
                                {/* テキストエリアとカウンターの複合 UI */}
                                <InputGroup>
                                    <InputGroupTextarea
                                        {...field}
                                        id="form-rhf-demo-tenant-bio"
                                        placeholder="モビリティ向けの予約/決済プラットフォームを提供しています。"
                                        rows={6}
                                        className="min-h-24 resize-none"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {/* 右下に文字数を表示 */}
                                    <InputGroupAddon align="block-end">
                                        <InputGroupText className="tabular-nums">
                                            {field.value.length}/100 文字
                                        </InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                                {/* 入力のガイド文 */}
                                <FieldDescription>
                                    サービス内容や特徴を簡潔に記載してください。
                                </FieldDescription>
                                {/* バリデーションエラーがある場合のみ表示 */}
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Field>
                        <FieldLabel>テナント画像</FieldLabel>
                        <FilePond
                            files={files}
                            onupdatefiles={setFiles}
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
                                ✅ 画像を保存しました（storageId:{" "}
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
                <Button type="submit" form="form-rhf-demo">
                    送信
                </Button>
            </Field>
        </div>
    );
};
export default CreateTenantForm;
