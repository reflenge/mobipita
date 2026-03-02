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

/** 店舗形態の選択肢（移動店舗 / 固定店舗） */
export const storeTypeOptions = [
    { value: "mobile", label: "移動店舗" },
    { value: "fixed", label: "固定店舗" },
] as const;

/**
 * 店舗ステータス（長期の店舗ライフサイクル）の選択肢。
 */
export const tenantStatusOptions = [
    {
        value: "preparing",
        label: "準備中: 営業開始前（準備期間）",
        description: "開店準備中。予約や受付の公開前。",
    },
    {
        value: "open",
        label: "開店中: 通常営業中",
        description: "通常営業。予約受付・来店対応が可能。",
    },
    {
        value: "paused",
        label: "休業中: 一時営業停止（再開予定あり）",
        description: "一時停止。再開予定あり。",
    },
    {
        value: "closed",
        label: "閉業: 営業終了（再開予定なし）",
        description: "営業終了。再開予定なし。",
    },
] as const;

/** テナント作成フォームのバリデーションスキーマ（Zod） */
export const formSchema = z.object({
    tenantName: z
        .string()
        .min(5, "テナント名は5文字以上で入力してください。")
        .max(32, "テナント名は32文字以内で入力してください。"),
    /** 連絡先電話番号（任意） */
    phoneNumber: z
        .string()
        .regex(/^[0-9-]*$/, "電話番号は数字とハイフンのみで入力してください")
        .max(20, "20文字以内で入力してください")
        .transform((val) => (val === "" ? undefined : val))
        .optional(),
    tenantType: z.enum(["direct", "tenant"]),
    tenantStatus: z.enum(["preparing", "open", "paused", "closed"]),
    storeType: z.enum(["mobile", "fixed"]),
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
