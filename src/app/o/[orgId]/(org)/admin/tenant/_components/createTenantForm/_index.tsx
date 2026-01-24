"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
];

const schema = z.object({
    image: z
        .instanceof(File, { message: "画像ファイルを選択してください" })
        .refine((file) => file.size > 0, "画像ファイルを選択してください")
        .refine(
            (file) => file.size <= MAX_FILE_SIZE,
            "画像は 5MB 以下にしてください",
        )
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
            "対応形式: jpeg / png / webp / gif / avif",
        ),
});

type FormValues = z.infer<typeof schema>;

export default function UploadPage() {
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const saveImage = useMutation(api.files.saveImage);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    // プレビュー用
    const file = watch("image");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const [result, setResult] = useState<
        | { ok: true; storageId: Id<"_storage"> }
        | { ok: false; message: string }
        | null
    >(null);

    const onSubmit = async (values: FormValues) => {
        setResult(null);

        try {
            // 1) upload用URLを発行（Convex mutation）
            const uploadUrl = await generateUploadUrl();

            // 2) ブラウザから Convex に直接 POST（レスポンスに storageId が返る）
            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    // file.type を付けると扱いやすい
                    "Content-Type": values.image.type,
                },
                body: values.image,
            });

            if (!res.ok) {
                throw new Error(
                    `Upload failed: ${res.status} ${res.statusText}`,
                );
            }

            const json = (await res.json()) as { storageId: Id<"_storage"> };
            const storageId = json.storageId;

            // 3) storageId を DB に保存（Convex mutation）
            await saveImage({
                storageId,
                fileName: values.image.name,
                contentType: values.image.type,
                size: values.image.size,
            });

            setResult({ ok: true, storageId });
            reset(); // フォームリセット
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            setResult({ ok: false, message });
        }
    };

    return (
        <main className="mx-auto mt-10 max-w-[520px] px-4">
            <h1 className="text-xl font-bold">画像アップロード</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <Controller
                    name="image"
                    control={control}
                    render={({ field }) => (
                        <div className="grid gap-2">
                            <label className="font-semibold">画像ファイル</label>

                            <input
                                type="file"
                                accept="image/*"
                                // file input は value を直接制御しない
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) field.onChange(f);
                                }}
                                className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
                            />

                            {errors.image && (
                                <p className="m-0 text-sm text-red-600">
                                    {errors.image.message}
                                </p>
                            )}

                            {previewUrl && (
                                <div className="mt-2">
                                    <p className="my-2 font-semibold">
                                        プレビュー
                                    </p>
                                    <Image
                                        src={previewUrl}
                                        alt="preview"
                                        width={800}
                                        height={800}
                                        unoptimized
                                        className="w-full rounded-xl border border-neutral-200"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 rounded-xl border border-neutral-200 px-3.5 py-2.5 font-bold text-neutral-900 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "アップロード中..." : "アップロードする"}
                </button>

                {result && (
                    <div className="mt-4">
                        {result.ok ? (
                            <p className="m-0">
                                ✅ 保存完了（storageId:{" "}
                                <code>{result.storageId}</code>）
                            </p>
                        ) : (
                            <p className="m-0 text-red-600">
                                ❌ {result.message}
                            </p>
                        )}
                    </div>
                )}
            </form>
        </main>
    );
}
