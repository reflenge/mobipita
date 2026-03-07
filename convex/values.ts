import { v } from "convex/values";

/**
 * ユーザーロール（強い順）。
 * - admin: 最高管理者（開発会社）
 * - company: 導入会社（株式会社BEYOND KAMPO）
 * - staff: 店舗スタッフ
 * - customer: お客さん（デフォルト）
 */
export const userRole = v.union(
    v.literal("admin"),
    v.literal("company"),
    v.literal("staff"),
    v.literal("customer"),
);

/** ロールの強さ順マップ（数値が大きいほど強い） */
export const ROLE_LEVEL: Record<string, number> = {
    admin: 40,
    company: 30,
    staff: 20,
    customer: 10,
};

/** ファイルの状態（仮置き / 本紐付け） */
export const fileStatus = v.union(
    v.literal("temporary"),
    v.literal("attached"),
);

/** テナントの種別（直営 / テナント） */
export const tenantType = v.union(v.literal("direct"), v.literal("tenant"));

/** テナントの運用状態（店舗ステータス） */
export const tenantStatus = v.union(
    v.literal("preparing"),
    v.literal("open"),
    v.literal("paused"),
    v.literal("closed"),
);

/** 店舗の形態（移動店舗 / 固定店舗） */
export const storeType = v.union(v.literal("mobile"), v.literal("fixed"));

/** 予約枠の受付状態 */
export const slotStatus = v.union(v.literal("open"), v.literal("closed"));

/** 予約枠の公開範囲 */
export const slotVisibility = v.union(
    v.literal("public"),
    v.literal("unlisted"),
    v.literal("private"),
);

/** 予約のステータス */
export const bookingStatus = v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("canceled"),
    v.literal("no_show"),
);
