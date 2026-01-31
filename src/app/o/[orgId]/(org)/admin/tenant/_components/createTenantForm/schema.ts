import * as z from "zod";

/** テナントロゴ画像の最大ファイルサイズ（5MB） */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
/** アップロード許可する画像の MIME タイプ */
export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
] as const;

/** テナント種別の選択肢（直営 / テナント） */
export const tenantTypeOptions = [
    { value: "tenant", label: "テナント" },
    { value: "direct", label: "直営" },
] as const;

/** テナント状態の選択肢（準備中 / 公開中 / 一時停止 / 終了） */
export const tenantStatusOptions = [
    { value: "preparing", label: "準備中" },
    { value: "open", label: "公開中" },
    { value: "paused", label: "一時停止" },
    { value: "closed", label: "終了" },
] as const;

/** テナント作成フォームのバリデーションスキーマ（Zod） */
export const formSchema = z.object({
    /** テナント名（5〜32文字） */
    tenantName: z
        .string()
        .min(5, "テナント名は5文字以上で入力してください。")
        .max(32, "テナント名は32文字以内で入力してください。"),
    /** テナントスラッグ（URL 用。英数字・ハイフン、先頭末尾は英字） */
    tenantSlug: z
        .string()
        .min(5, "テナントスラッグは5文字以上で入力してください。")
        .max(32, "テナントスラッグは32文字以内で入力してください。")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z]$/,
            "テナントスラッグは英数字とハイフンのみで、先頭と末尾は英字にしてください。",
        ),
    /** テナント種別（直営 / テナント） */
    tenantType: z.enum(["direct", "tenant"]),
    /** テナントの運用状態 */
    tenantStatus: z.enum(["preparing", "open", "paused", "closed"]),
    /** テナントロゴ画像（任意。選択時は RHF + Zod でサイズ・形式を検証） */
    tenantLogo: z
        .instanceof(File)
        .optional()
        .nullable()
        .refine(
            (f) => !f || f.size <= MAX_FILE_SIZE,
            "5MB 以下の画像を選択してください。",
        )
        .refine(
            (f) =>
                !f ||
                (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type),
            "対応形式: jpeg / png / webp / gif / avif",
        ),
});

/** フォーム入力値の型（formSchema から推論） */
export type CreateTenantFormValues = z.infer<typeof formSchema>;
