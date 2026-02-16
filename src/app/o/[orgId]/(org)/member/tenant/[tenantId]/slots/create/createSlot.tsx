"use client";

import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Tiptap from "@/components/Tiptap";
import CreateSlotSkeleton from "./createSlotSkeleton";

const questionTypeEnum = z.enum([
    "text",
    "textarea",
    "number",
    "email",
    "tel",
    "date",
    "time",
]);

const formSchema = z.object({
    slotTemplate: z.object({
        tenantId: z.string(),
        serviceId: z.string(),
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
});

const DEFAULT_SLOT_TEMPLATE: z.infer<typeof formSchema>["slotTemplate"] = {
    tenantId: "",
    serviceId: "",
    durationMinutes: 60,
    defaultCapacity: 2,
    defaultVisibility: "public",
    defaultLocationId: "",
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

type Props = {
    orgId: string;
    tenantId: string;
};

export function CreateSlot({ orgId, tenantId }: Props) {
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    // サービス一覧（TODO: Convex でテナント別サービス取得に差し替え）
    // const services: { _id: string; tenantId: string; title: string }[] = [
    //     ...Array(5),
    // ].map((_, i) => ({
    //     _id: `svc_${String(i + 1).padStart(3, "0")}`,
    //     tenantId,
    //     title: `サンプルサービス${i + 1}`,
    // }));

    // サービスデータを取得
    // TODO: isActive は false の場合は表示しない
    const services: { _id: string; _creationTime: number; tenantId: string; title: string; description: string; isActive: boolean }[] | null | undefined = [...Array(5)].map((_, index) => (
        {
            _id: `dataid_${(index + 3).toString().padStart(3, "0")}`,
            _creationTime: new Date().getTime() + index * 1000,
            tenantId: `tenant_${(index + 3).toString().padStart(3, "0")}`,
            title: `サンプルサービス${(index + 3).toString().padStart(3, "0")}`,
            description: `<p>サンプルサービス${(index + 3).toString().padStart(3, "0")}の説明</p>`,
            isActive: true,
        }));
    console.log("🚀 => CreateSlot => services:", services)

    const locations: { _id: string; _creationTime: number; tenantId: string; type: "fixed" | "mobile"; name: string; address: string; geo: { lat: number; lng: number }; details: string }[] | null | undefined = [...Array(5)].map((_, index) => (
        {
            _id: `dataid_${(index + 3).toString().padStart(3, "0")}`,
            _creationTime: new Date().getTime() + index * 1000,
            tenantId: `tenant_${(index + 3).toString().padStart(3, "0")}`,
            type: Math.random() < 0.5 ? "fixed" : "mobile",
            name: `固定店舗（サンプル${(index + 3).toString().padStart(3, "0")})`,
            address: `高知県〇〇市〇〇町${index + 3}-2-3`,
            geo: {
                lat: 33.5597 + Math.random() * 0.01,
                lng: 133.5311 + Math.random() * 0.01
            },
            details: "入口は北側。駐車場2台分あり。看板が目印。",
        }));
    console.log("🚀 => CreateSlot => locations:", locations)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            slotTemplate: {
                tenantId,
                serviceId: services[0]?._id ?? "",
                durationMinutes: 60,
                defaultCapacity: 2,
                defaultVisibility: "public",
                defaultLocationId: "loc_fixed_shop",
                acceptanceWindow: {
                    openBeforeMinutes: 86400, // 60日前
                    closeBeforeMinutes: 180, // 3時間前
                },
                bufferMinutes: 30,
                dailyBookingLimit: 4,
                form: {
                    questions: [
                        { id: "q_question1", label: "<p>質問1</p>", type: "textarea", required: false },
                    ],
                },
                reminders: {
                    email: { amountMinutes: 1440 }, // 1日前
                },
                cancellationPolicy: {
                    cancelDeadlineMinutes: 60,
                    allowCustomerCancel: true,
                    allowRescheduling: true,
                    rescheduleDeadlineMinutes: 120,
                },
            },
        },
        mode: "all",
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "slotTemplate.form.questions",
    });

    useEffect(() => {
        if (tenant && !form.getValues("slotTemplate.serviceId") && services[0]) {
            form.setValue("slotTemplate.tenantId", tenantId);
            form.setValue("slotTemplate.serviceId", services[0]._id);
        }
    }, [tenant, tenantId, form, services]);

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log("🚀 => onSubmit => data:", data);
        toast(
            <pre className="bg-code text-code-foreground w-[520px] overflow-x-auto">
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
        );
    }

    if (!tenant) {
        return <CreateSlotSkeleton />;
    }

    return (
        <div className="mx-auto container px-6 py-10 space-y-6">
            <div>
                <div className="text-xl">予約枠作成</div>
                <p className="text-sm text-muted-foreground">
                    {tenant.tenantName} {tenant._id} の予約枠を新規作成します
                </p>
            </div>

            <form
                id="form-slot-create"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <FieldGroup className="space-y-4">
                    <input
                        type="hidden"
                        {...form.register("slotTemplate.tenantId")}
                    />

                    {/* サービス */}
                    <Controller
                        name="slotTemplate.serviceId"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-slot-create-service-id">
                                    サービス
                                </FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="form-slot-create-service-id"
                                        aria-invalid={fieldState.invalid}
                                        className="w-full max-w-xs"
                                    >
                                        <SelectValue placeholder="サービスを選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem
                                                key={s._id}
                                                value={s._id}
                                            >
                                                {s.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    この予約枠を紐づけるサービスを選びます。
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* 枠の長さ・収容数・表示 */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Controller
                            name="slotTemplate.durationMinutes"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-duration">
                                        枠の長さ（分）
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-slot-duration"
                                        type="number"
                                        min={1}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.valueAsNumber || 0
                                            )
                                        }
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        1枠あたりの長さ。例: 60 = 1時間
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="slotTemplate.defaultCapacity"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-capacity">
                                        同時予約数
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-slot-capacity"
                                        type="number"
                                        min={1}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.valueAsNumber || 0
                                            )
                                        }
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        同じ枠に同時に何件まで予約できるか
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="slotTemplate.defaultVisibility"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-visibility">
                                        表示
                                    </FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id="form-slot-visibility"
                                            aria-invalid={fieldState.invalid}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="public">
                                                公開
                                            </SelectItem>
                                            <SelectItem value="unlisted">
                                                非公開リスト
                                            </SelectItem>
                                            <SelectItem value="private">
                                                非公開
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldDescription>
                                        公開=一覧に表示 / 非公開リスト=リンクを知っている人のみ / 非公開=一覧に表示しない
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    {/* 受付期間 */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Controller
                            name="slotTemplate.acceptanceWindow.openBeforeMinutes"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-open-before">
                                        受付開始（開始何分前から）
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-slot-open-before"
                                        type="number"
                                        min={0}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.valueAsNumber ?? 0
                                            )
                                        }
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        予約を受け付け始める時期。86400分 = 60日前から受付開始
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="slotTemplate.acceptanceWindow.closeBeforeMinutes"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-close-before">
                                        受付締切（開始何分前まで）
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-slot-close-before"
                                        type="number"
                                        min={0}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.valueAsNumber ?? 0
                                            )
                                        }
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        予約の締め切り。180分 = 開始3時間前で受付終了
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    {/* バッファ・1日上限 */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Controller
                            name="slotTemplate.bufferMinutes"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-buffer">
                                        枠間バッファ（分）
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-slot-buffer"
                                        type="number"
                                        min={0}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.valueAsNumber ?? 0
                                            )
                                        }
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        連続する枠の間に設ける休憩時間。例: 30 = 枠と枠の間に30分空ける
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="slotTemplate.dailyBookingLimit"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-slot-daily-limit">
                                        1日あたり予約上限
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-slot-daily-limit"
                                        type="number"
                                        min={0}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.valueAsNumber ?? 0
                                            )
                                        }
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldDescription>
                                        1日あたり、成立した予約が何件まで許容するか。0で無制限
                                    </FieldDescription>
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </div>

                    {/* フォーム質問（お客に聞く項目） */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div>
                                <FieldLabel>予約時に聞く質問</FieldLabel>
                                <FieldDescription>
                                    予約フォームでお客様に聞く項目を追加できます。お名前・電話番号・備考など。
                                </FieldDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    append({
                                        id: `q_${Date.now()}`,
                                        label: "<p></p>",
                                        type: "text",
                                        required: false,
                                    })
                                }
                            >
                                質問を追加
                            </Button>
                        </div>
                        {fields.map((fieldItem, index) => (
                            <div
                                key={fieldItem.id}
                                className="rounded-lg border p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium">
                                        質問 {index + 1}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        削除
                                    </Button>
                                </div>
                                <input
                                    type="hidden"
                                    {...form.register(
                                        `slotTemplate.form.questions.${index}.id`
                                    )}
                                />
                                <Controller
                                    name={`slotTemplate.form.questions.${index}.label`}
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>ラベル（表示文言）</FieldLabel>
                                            <FieldDescription>
                                                予約画面に表示する質問文。装飾（太字・リストなど）も可能です。
                                            </FieldDescription>
                                            <InputGroup>
                                                <Tiptap
                                                    sentence={field.value}
                                                    setSentence={field.onChange}
                                                    onBlur={field.onBlur}
                                                    id={`form-slot-question-label-${index}`}
                                                    aria-invalid={fieldState.invalid}
                                                    className="min-h-24 max-h-48 overflow-y-auto w-full"
                                                />
                                                <InputGroupAddon align="block-end">
                                                    <InputGroupText className="tabular-nums">
                                                        {field.value.length} 文字
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            {fieldState.invalid && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Controller
                                        name={`slotTemplate.form.questions.${index}.type`}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel>入力タイプ</FieldLabel>
                                                <FieldDescription>
                                                    お客様が入力する形式（テキスト・電話番号・日付など）
                                                </FieldDescription>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="text">
                                                            テキスト
                                                        </SelectItem>
                                                        <SelectItem value="textarea">
                                                            長文
                                                        </SelectItem>
                                                        <SelectItem value="tel">
                                                            電話番号
                                                        </SelectItem>
                                                        <SelectItem value="email">
                                                            メール
                                                        </SelectItem>
                                                        <SelectItem value="number">
                                                            数値
                                                        </SelectItem>
                                                        <SelectItem value="date">
                                                            日付
                                                        </SelectItem>
                                                        <SelectItem value="time">
                                                            時刻
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        name={`slotTemplate.form.questions.${index}.required`}
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <FieldLabel>必須 / 任意</FieldLabel>
                                                <FieldDescription>
                                                    この質問が必須か任意か
                                                </FieldDescription>
                                                <Select
                                                    value={field.value ? "required" : "optional"}
                                                    onValueChange={(v) =>
                                                        field.onChange(v === "required")
                                                    }
                                                >
                                                    <SelectTrigger
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                    >
                                                        <SelectValue placeholder="選択" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="required">
                                                            必須
                                                        </SelectItem>
                                                        <SelectItem value="optional">
                                                            任意
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.invalid && (
                                                    <FieldError
                                                        errors={[
                                                            fieldState.error,
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* リマインダー */}
                    <Controller
                        name="slotTemplate.reminders.email.amountMinutes"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-slot-reminder">
                                    リマインダー送信（開始何分前）
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-slot-reminder"
                                    type="number"
                                    min={0}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.valueAsNumber ?? 0
                                        )
                                    }
                                    aria-invalid={fieldState.invalid}
                                />
                                <FieldDescription>
                                    予約の何分前にリマインダーメールを送るか。1440分 = 1日前
                                </FieldDescription>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    {/* キャンセル・変更ポリシー */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <div>
                            <FieldLabel>キャンセル・変更ポリシー</FieldLabel>
                            <FieldDescription>
                                キャンセル・日時変更のルールを設定します。
                            </FieldDescription>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                name="slotTemplate.cancellationPolicy.cancelDeadlineMinutes"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-slot-cancel-deadline">
                                            キャンセル期限（開始何分前まで）
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-slot-cancel-deadline"
                                            type="number"
                                            min={0}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.valueAsNumber ?? 0
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldDescription>
                                            お客様がキャンセルできる期限。60 = 開始1時間前まで
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="slotTemplate.cancellationPolicy.rescheduleDeadlineMinutes"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-slot-reschedule-deadline">
                                            変更期限（開始何分前まで）
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-slot-reschedule-deadline"
                                            type="number"
                                            min={0}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.valueAsNumber ?? 0
                                                )
                                            }
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <FieldDescription>
                                            日時変更（リスケ）できる期限。120 = 開始2時間前まで
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <Controller
                                name="slotTemplate.cancellationPolicy.allowCustomerCancel"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        orientation="horizontal"
                                    >
                                        <FieldContent>
                                            <FieldLabel>
                                                顧客キャンセル可
                                            </FieldLabel>
                                            <FieldDescription>
                                                OFFにするとお客様はキャンセルできません
                                            </FieldDescription>
                                        </FieldContent>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="slotTemplate.cancellationPolicy.allowRescheduling"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field
                                        data-invalid={fieldState.invalid}
                                        orientation="horizontal"
                                    >
                                        <FieldContent>
                                            <FieldLabel>
                                                日時変更（リスケジュール）可
                                            </FieldLabel>
                                            <FieldDescription>
                                                OFFにするとお客様は日時の変更ができません
                                            </FieldDescription>
                                        </FieldContent>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </div>
                    </div>
                </FieldGroup>

                <Field orientation="horizontal" className="gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            form.reset({
                                slotTemplate: {
                                    ...DEFAULT_SLOT_TEMPLATE,
                                    tenantId,
                                    serviceId:
                                        form.getValues("slotTemplate.serviceId") ||
                                        services[0]?._id ||
                                        "",
                                },
                            })
                        }
                    >
                        Reset
                    </Button>
                    <Button type="submit" form="form-slot-create">
                        作成する
                    </Button>
                </Field>
            </form>
        </div>
    );
}
