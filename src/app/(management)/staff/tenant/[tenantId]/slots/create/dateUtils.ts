/**
 * 日付・時刻に関するユーティリティ関数。
 * date-fns を使用し、日本語ロケール（ja）で統一。
 */
import { addDays, format, parse } from "date-fns";
import { ja } from "date-fns/locale";

export const JST_LOCALE = ja;

/** 今日の日付を yyyy-MM-dd 形式で返す */
export function getTodayYYYYMMDD(): string {
    return format(new Date(), "yyyy-MM-dd", { locale: JST_LOCALE });
}

/** yyyy-MM-dd 文字列を Date に変換。パース不可なら undefined */
export function parseDateYYYYMMDD(str: string): Date | undefined {
    if (!str) return undefined;
    try {
        return parse(str, "yyyy-MM-dd", new Date(), { locale: JST_LOCALE });
    } catch {
        return undefined;
    }
}

/** Date を "yyyy年M月d日" 形式の表示用文字列に変換 */
export function formatDateJST(date: Date): string {
    return format(date, "yyyy年M月d日", { locale: JST_LOCALE });
}

/**
 * 時刻文字列を 0:00 基準の分数に変換。
 * HH:mm（5文字以下）と HH:mm:ss（6文字以上）を自動判別。
 * パース不可なら NaN を返す。
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

/** getTodayYYYYMMDD のエイリアス（schema.ts から参照） */
export function getTodayLocalYYYYMMDD(): string {
    return format(new Date(), "yyyy-MM-dd", { locale: JST_LOCALE });
}

/** yyyy-MM-dd 文字列に指定日数を加算した yyyy-MM-dd を返す */
export function addDaysToYYYYMMDD(dateStr: string, days: number): string {
    const d = parseDateYYYYMMDD(dateStr);
    if (!d) return dateStr;
    return format(addDays(d, days), "yyyy-MM-dd", { locale: JST_LOCALE });
}
