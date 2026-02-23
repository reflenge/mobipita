import { v } from "convex/values";

/** メッセージの公開範囲（全体 / 組織） */
export const messageScope = v.union(
    v.literal("global"),
    v.literal("organization"),
);

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
export const slotStatus = v.union(
    v.literal("open"),
    v.literal("closed"),
);

/** 予約枠の公開範囲 */
export const slotVisibility = v.union(
    v.literal("public"),
    v.literal("unlisted"),
    v.literal("private"),
);
