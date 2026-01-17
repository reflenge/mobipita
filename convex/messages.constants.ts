import { v } from "convex/values";

// メッセージの送信先（全体 / 組織）を厳密に制限する。
export const messageScope = v.union(v.literal("global"), v.literal("organization"));
// 取得するメッセージ件数の上限（無制限にしないため）。
export const defaultMessageLimit = 100;
