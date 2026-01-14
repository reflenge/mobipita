import { z } from "zod";

// メッセージ本文の最大文字数。
export const messageMaxLength = 140;

// メッセージ本文のバリデーションルール。
export const messageTextSchema = z
    .string()
    .min(1, "Message is required.")
    .max(messageMaxLength, "Message must be 140 characters or less.");

// フォーム入力全体のスキーマ。
export const messageFormSchema = z.object({
    message: messageTextSchema,
});

// フォーム値の型。
export type MessageFormValues = z.infer<typeof messageFormSchema>;
