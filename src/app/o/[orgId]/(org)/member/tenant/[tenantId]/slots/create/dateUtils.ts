import { addDays, format, parse } from "date-fns";
import { ja } from "date-fns/locale";

export const JST_LOCALE = ja;

export function getTodayYYYYMMDD(): string {
    return format(new Date(), "yyyy-MM-dd", { locale: JST_LOCALE });
}

export function parseDateYYYYMMDD(str: string): Date | undefined {
    if (!str) return undefined;
    try {
        return parse(str, "yyyy-MM-dd", new Date(), { locale: JST_LOCALE });
    } catch {
        return undefined;
    }
}

export function formatDateJST(date: Date): string {
    return format(date, "yyyy年M月d日", { locale: JST_LOCALE });
}

/**
 * HH:mm または HH:mm:ss を分に変換（0時0分基準）。不正な場合は NaN
 */
export function parseTimeToMinutes(str: string): number {
    if (!str || typeof str !== "string") return NaN;
    try {
        const ref = new Date(0);
        const parsed =
            str.length <= 5
                ? parse(str, "HH:mm", ref, { locale: JST_LOCALE })
                : parse(str, "HH:mm:ss", ref, { locale: JST_LOCALE });
        return parsed.getHours() * 60 + parsed.getMinutes();
    } catch {
        return NaN;
    }
}

/**
 * 今日の日付を yyyy-MM-dd で返す（ローカルタイムゾーン）
 */
export function getTodayLocalYYYYMMDD(): string {
    return format(new Date(), "yyyy-MM-dd", { locale: JST_LOCALE });
}

/**
 * 日付文字列（yyyy-MM-dd）に指定日数を加算して返す
 */
export function addDaysToYYYYMMDD(dateStr: string, days: number): string {
    const d = parseDateYYYYMMDD(dateStr);
    if (!d) return dateStr;
    return format(addDays(d, days), "yyyy-MM-dd", { locale: JST_LOCALE });
}
