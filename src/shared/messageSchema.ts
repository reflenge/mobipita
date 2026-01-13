import { z } from "zod";

export const messageMaxLength = 140;

export const messageTextSchema = z
    .string()
    .min(1, "Message is required.")
    .max(messageMaxLength, "Message must be 140 characters or less.");

export const messageFormSchema = z.object({
    message: messageTextSchema,
});

export type MessageFormValues = z.infer<typeof messageFormSchema>;
