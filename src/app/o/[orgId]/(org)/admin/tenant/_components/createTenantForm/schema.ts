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
 * 店舗そのものが「事業として存在し、顧客を受け入れる体制か」を表す。
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
    /** 店舗形態（移動店舗 / 固定店舗） */
    storeType: z.enum(["mobile", "fixed"]),
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

/**
 * テナントスラッグ用に UUID v4 から 32 文字の英数字文字列を生成する。
 * スキーマ（先頭・末尾が英字）を満たすよう必要なら先頭・末尾を 'a' に置き換える。
 */
export function generateTenantSlug(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        let s = crypto.randomUUID().replace(/-/g, "");
        if (!/^[a-zA-Z]/.test(s)) s = "a" + s.slice(1);
        if (!/[a-zA-Z]$/.test(s)) s = s.slice(0, -1) + "a";
        return s;
    }
    const hex = "0123456789abcdef";
    let s = "";
    for (let i = 0; i < 32; i++) s += hex[Math.floor(Math.random() * 16)];
    if (!/^[a-zA-Z]/.test(s)) s = "a" + s.slice(1);
    if (!/[a-zA-Z]$/.test(s)) s = s.slice(0, -1) + "a";
    return s;
}
