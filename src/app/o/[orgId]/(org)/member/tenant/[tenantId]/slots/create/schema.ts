import * as z from "zod";
import {
    getTodayLocalYYYYMMDD,
    parseTimeToMinutes,
} from "./dateUtils";

// ─── 質問タイプ ────────────────────────────────────────────
export const questionTypeEnum = z.enum([
    "text",
    "textarea",
    "number",
    "email",
    "tel",
    "date",
    "time",
]);

// ─── パターン定数 ──────────────────────────────────────────
/** HTML5 time input の出力形式に合わせた時刻パターン */
const TIME_PATTERN = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ─── バリデーションヘルパー ────────────────────────────────

/** 開始 < 終了 を分単位で比較 */
function isTimeBefore(a: string, b: string): boolean {
    const aMin = parseTimeToMinutes(a);
    const bMin = parseTimeToMinutes(b);
    if (Number.isNaN(aMin) || Number.isNaN(bMin)) return false;
    return aMin < bMin;
}

/** 2つの時間帯が重なるか判定（境界一致は重複としない） */
function timeRangesOverlap(
    a: { start: string; end: string },
    b: { start: string; end: string }
): boolean {
    const aStart = parseTimeToMinutes(a.start);
    const aEnd = parseTimeToMinutes(a.end);
    const bStart = parseTimeToMinutes(b.start);
    const bEnd = parseTimeToMinutes(b.end);
    if (
        Number.isNaN(aStart) ||
        Number.isNaN(aEnd) ||
        Number.isNaN(bStart) ||
        Number.isNaN(bEnd)
    ) {
        return false;
    }
    return aStart < bEnd && bStart < aEnd;
}

// ─── クロスフィールドバリデーション ────────────────────────

export type CrossFieldError = { path: string; message: string };

/**
 * dateTimeSlots のクロスフィールドバリデーション。
 *
 * zodResolver の superRefine ではなく、コンポーネント側の useMemo から呼ばれる。
 * react-hook-form の mode:"all" は変更フィールドのエラーしか更新しないため、
 * superRefine でクロスフィールドエラーを設定すると未変更フィールドに古いエラーが残る。
 * そのため zodResolver とは独立に、同期的にエラーを計算してコンポーネントに渡す方式を採用。
 *
 * チェック順序:
 *   1. 過去日付チェック
 *   2. 終了時刻 > 開始時刻
 *   3. 時間帯の長さ >= 枠の長さ（durationMinutes）
 *   4. 同一日付内の時間帯重複
 */
export function validateDateTimeSlots(
    dateTimeSlots: Array<{ date: string; timeRanges: Array<{ start: string; end: string }> }>,
    durationMinutes: number,
): CrossFieldError[] {
    const errors: CrossFieldError[] = [];
    const today = getTodayLocalYYYYMMDD();

    dateTimeSlots.forEach((slot, slotIndex) => {
        const timeRanges = slot?.timeRanges ?? [];
        if (!Array.isArray(timeRanges) || timeRanges.length === 0) return;

        // 1. 過去チェック
        const dateStr = slot?.date;
        if (dateStr && dateStr < today) {
            errors.push({
                path: `dateTimeSlots.${slotIndex}.date`,
                message: "過去の日付は指定できません",
            });
        }

        // 2. 終了時刻チェック（終了 > 開始）
        timeRanges.forEach((range, rangeIndex) => {
            if (!range?.start || !range?.end) return;
            if (!isTimeBefore(range.start, range.end)) {
                errors.push({
                    path: `dateTimeSlots.${slotIndex}.timeRanges.${rangeIndex}.end`,
                    message: "終了時刻は開始時刻より後にしてください",
                });
            }
        });

        // 3. 長さチェック（時間帯の長さ >= 枠の長さ）
        timeRanges.forEach((range, rangeIndex) => {
            if (!range?.start || !range?.end) return;
            const startMin = parseTimeToMinutes(range.start);
            const endMin = parseTimeToMinutes(range.end);
            if (Number.isNaN(startMin) || Number.isNaN(endMin)) return;

            const rangeMinutes = endMin - startMin;
            if (rangeMinutes < durationMinutes) {
                errors.push({
                    path: `dateTimeSlots.${slotIndex}.timeRanges.${rangeIndex}.end`,
                    message: `時間帯の長さは枠の長さ（${durationMinutes}分）以上にしてください`,
                });
            }
        });

        // 4. 重複チェック（同一日付内のペアを全探索）
        for (let i = 0; i < timeRanges.length; i++) {
            for (let j = i + 1; j < timeRanges.length; j++) {
                const r1 = timeRanges[i];
                const r2 = timeRanges[j];
                if (!r1 || !r2) continue;
                if (timeRangesOverlap(r1, r2)) {
                    errors.push({
                        path: `dateTimeSlots.${slotIndex}.timeRanges.${i}.end`,
                        message: "時間帯が重複しています",
                    });
                    errors.push({
                        path: `dateTimeSlots.${slotIndex}.timeRanges.${j}.end`,
                        message: "時間帯が重複しています",
                    });
                }
            }
        }
    });

    return errors;
}

// ─── Zod スキーマ ──────────────────────────────────────────
// フィールドレベルのバリデーション（フォーマット・必須・最小値）のみ定義。
// クロスフィールドバリデーションは validateDateTimeSlots() で別途処理する。

/** 時刻の開始・終了ペア（フォーマットのみ検証） */
export const timeRangeSchema = z.object({
    start: z
        .string()
        .min(1, "開始時刻を入力")
        .regex(TIME_PATTERN, "時刻は HH:mm 形式で入力してください"),
    end: z
        .string()
        .min(1, "終了時刻を入力")
        .regex(TIME_PATTERN, "時刻は HH:mm 形式で入力してください"),
});

/** 日付 + 時間帯の配列 */
export const dateTimeSlotSchema = z.object({
    date: z
        .string()
        .min(1, "日付を選択してください")
        .regex(DATE_PATTERN, "有効な日付を入力してください"),
    timeRanges: z.array(timeRangeSchema).min(1, "時間帯を1つ以上追加"),
});

/**
 * zodResolver に渡すフォーム全体のスキーマ。
 * superRefine は含めない（理由は validateDateTimeSlots の JSDoc 参照）。
 */
export const formSchema = z.object({
    slotTemplate: z.object({
        tenantId: z.string(),
        serviceId: z.string(),
        defaultLocationId: z.string(),
        durationMinutes: z.number().min(1, "1分以上"),
        defaultCapacity: z.number().min(1, "1以上"),
        defaultVisibility: z.enum(["public", "unlisted", "private"]),
        acceptanceWindow: z.object({
            openBeforeMinutes: z.number().min(0),
            closeBeforeMinutes: z.number().min(0),
        }),
        bufferMinutes: z.number().min(0),
        dailyBookingLimit: z.number().min(0),
        form: z.object({
            questions: z.array(
                z.object({
                    id: z.string().min(1, "IDを入力"),
                    label: z.string().min(1, "ラベルを入力"),
                    type: questionTypeEnum,
                    required: z.boolean(),
                })
            ),
        }),
        reminders: z.object({
            email: z.object({
                amountMinutes: z.number().min(0),
            }),
        }),
        cancellationPolicy: z.object({
            cancelDeadlineMinutes: z.number().min(0),
            allowCustomerCancel: z.boolean(),
            allowRescheduling: z.boolean(),
            rescheduleDeadlineMinutes: z.number().min(0),
        }),
    }),
    dateTimeSlots: z
        .array(dateTimeSlotSchema)
        .min(1, "日付と時間帯を1つ以上追加してください"),
});

export type FormValues = z.infer<typeof formSchema>;

// ─── デフォルト値 ──────────────────────────────────────────
/** フォームリセット時に使用する slotTemplate のデフォルト値 */
export const DEFAULT_SLOT_TEMPLATE: FormValues["slotTemplate"] = {
    tenantId: "",
    serviceId: "",
    defaultLocationId: "",
    durationMinutes: 60,
    defaultCapacity: 2,
    defaultVisibility: "public",
    acceptanceWindow: {
        openBeforeMinutes: 86400,
        closeBeforeMinutes: 180,
    },
    bufferMinutes: 30,
    dailyBookingLimit: 4,
    form: {
        questions: [
            { id: "q_question1", label: "<p>質問1</p>", type: "textarea", required: false },
        ],
    },
    reminders: { email: { amountMinutes: 1440 } },
    cancellationPolicy: {
        cancelDeadlineMinutes: 60,
        allowCustomerCancel: true,
        allowRescheduling: true,
        rescheduleDeadlineMinutes: 120,
    },
};
