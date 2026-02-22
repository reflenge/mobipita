import * as z from "zod";

export const questionTypeEnum = z.enum([
    "text",
    "textarea",
    "number",
    "email",
    "tel",
    "date",
    "time",
]);

export const timeRangeSchema = z.object({
    start: z.string().min(1, "開始時刻を入力"),
    end: z.string().min(1, "終了時刻を入力"),
});

export const dateTimeSlotSchema = z.object({
    date: z.string().min(1, "日付を入力"),
    timeRanges: z.array(timeRangeSchema).min(1, "時間帯を1つ以上追加"),
});

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
    dateTimeSlots: z.array(dateTimeSlotSchema),
});

export type FormValues = z.infer<typeof formSchema>;

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
