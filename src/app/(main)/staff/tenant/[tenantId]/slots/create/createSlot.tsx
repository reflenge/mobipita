"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import CreateSlotSkeleton from "./createSlotSkeleton";
import { getTodayYYYYMMDD, parseTimeToMinutes } from "./dateUtils";
import {
    ServiceSelectField,
    LocationSelectField,
    VisibilitySelectField,
    DurationInputField,
    CapacityInputField,
    OpenBeforeInputField,
    CloseBeforeInputField,
    BufferInputField,
    DailyLimitInputField,
    ReminderInputField,
    DateTimeSlotsSection,
    FormQuestionsSection,
    CancellationPolicySection,
} from "./form-fields";
import {
    formSchema,
    type FormValues,
    DEFAULT_SLOT_TEMPLATE,
    validateDateTimeSlots,
} from "./schema";
import SlotCalender, { type SlotEvent } from "./slot-calender";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";

type Props = {
    tenantId: string;
};

/**
 * 予約枠作成ページのメインコンポーネント。
 *
 * バリデーション戦略:
 *   - フィールドレベル（フォーマット・必須）: zodResolver + mode:"all" が自動処理
 *   - クロスフィールド（過去日付・終了>開始・長さ・重複）: useWatch → useMemo で同期計算し props で子に渡す
 *     zodResolver に superRefine を含めると mode:"all" で変更フィールドのエラーしか更新されず
 *     古いエラーが残る問題があるため、superRefine は使わない。
 *   - submit 時: zodResolver のパス後、crossFieldErrors を追加チェック
 *
 * カレンダー連携:
 *   dateTimeSlots + durationMinutes + bufferMinutes を useWatch で購読し、
 *   useMemo で個々の予約枠イベントに変換して SlotCalender に渡す。
 */
export function CreateSlot({ tenantId }: Props) {
    // ─── データ取得 ─────────────────────────────────────────
    const tenant = useQuery(api.tenants.getById, {
        tenantId: tenantId as Id<"Tenants">,
    });

    const services = useQuery(api.services.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
    });
    const activeServices = useMemo(
        () => services?.filter((service) => service.isActive) ?? [],
        [services],
    );

    const locations = useQuery(api.locations.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
    });

    // ─── フォーム初期化 ────────────────────────────────────
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            slotTemplate: {
                tenantId,
                serviceId: activeServices[0]?._id ?? "",
                defaultLocationId: locations?.[0]?._id ?? "",
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
                        {
                            id: "q_question1",
                            label: "<p>質問1</p>",
                            type: "textarea",
                            required: false,
                        },
                    ],
                },
                reminders: {
                    email: { amountMinutes: 1440 },
                },
                cancellationPolicy: {
                    cancelDeadlineMinutes: 60,
                    allowCustomerCancel: true,
                    allowRescheduling: true,
                    rescheduleDeadlineMinutes: 120,
                },
            },
            dateTimeSlots: [
                {
                    date: getTodayYYYYMMDD(),
                    timeRanges: [
                        { start: "09:00", end: "14:00", locationId: "" },
                    ],
                },
            ],
        },
        mode: "all",
    });

    // ─── リアルタイム値の購読 ──────────────────────────────
    const watchedDateTimeSlots = useWatch({
        control: form.control,
        name: "dateTimeSlots",
    });
    const watchedDuration = useWatch({
        control: form.control,
        name: "slotTemplate.durationMinutes",
    });
    const watchedBuffer = useWatch({
        control: form.control,
        name: "slotTemplate.bufferMinutes",
    });
    const watchedDefaultLocationId = useWatch({
        control: form.control,
        name: "slotTemplate.defaultLocationId",
    });

    // ─── クロスフィールドバリデーション（同期） ────────────
    const crossFieldErrors = useMemo(
        () =>
            validateDateTimeSlots(
                watchedDateTimeSlots ?? [],
                Number(watchedDuration),
                watchedDefaultLocationId,
            ),
        [watchedDateTimeSlots, watchedDuration, watchedDefaultLocationId],
    );

    // ─── カレンダーイベント生成 ────────────────────────────
    const calendarEvents = useMemo((): SlotEvent[] => {
        const duration = Number(watchedDuration) || 0;
        const buffer = Number(watchedBuffer) || 0;
        if (duration <= 0) return [];

        const locationMap = new Map<string, string>(
            (locations ?? []).map((loc) => [loc._id as string, loc.name]),
        );
        const resolveLocationName = (locationId?: string) => {
            const id = locationId || watchedDefaultLocationId;
            return id ? (locationMap.get(id) ?? "") : "";
        };

        const events: SlotEvent[] = [];
        const pad = (n: number) => String(n).padStart(2, "0");
        const toTimeStr = (mins: number) =>
            `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

        for (const slot of watchedDateTimeSlots ?? []) {
            if (!slot?.date) continue;
            for (const range of slot.timeRanges ?? []) {
                const startMin = parseTimeToMinutes(range.start);
                const endMin = parseTimeToMinutes(range.end);
                if (
                    Number.isNaN(startMin) ||
                    Number.isNaN(endMin) ||
                    startMin >= endMin
                )
                    continue;

                const locName = resolveLocationName(range.locationId);

                let cursor = startMin;
                while (cursor + duration <= endMin) {
                    const slotEnd = cursor + duration;
                    events.push({
                        title: `${toTimeStr(cursor)}–${toTimeStr(slotEnd)}`,
                        start: `${slot.date}T${toTimeStr(cursor)}:00`,
                        end: `${slot.date}T${toTimeStr(slotEnd)}:00`,
                        extendedProps: { locationName: locName },
                    });
                    cursor = slotEnd + buffer;
                }
            }
        }
        return events;
    }, [
        watchedDateTimeSlots,
        watchedDuration,
        watchedBuffer,
        locations,
        watchedDefaultLocationId,
    ]);

    // ─── 非同期データ取得後のフォーム値補完 ────────────────
    useEffect(() => {
        if (tenant) {
            if (
                !form.getValues("slotTemplate.serviceId") &&
                activeServices[0]
            ) {
                form.setValue("slotTemplate.tenantId", tenantId);
                form.setValue("slotTemplate.serviceId", activeServices[0]._id);
            }
            if (
                !form.getValues("slotTemplate.defaultLocationId") &&
                locations?.[0]
            ) {
                form.setValue(
                    "slotTemplate.defaultLocationId",
                    locations[0]._id,
                );
            }
        }
    }, [tenant, tenantId, form, activeServices, locations]);

    // ─── Mutation ────────────────────────────────────────────
    const createBatch = useMutation(api.slots.createBatch);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── 送信ハンドラー ────────────────────────────────────
    const onSubmit = useCallback(
        async (data: FormValues) => {
            if (crossFieldErrors.length > 0) {
                for (const err of crossFieldErrors) {
                    form.setError(err.path as keyof FormValues, {
                        type: "custom",
                        message: err.message,
                    });
                }
                return;
            }

            const { slotTemplate, dateTimeSlots } = data;
            const duration = slotTemplate.durationMinutes;
            const buffer = slotTemplate.bufferMinutes;
            const defaultLocId = slotTemplate.defaultLocationId;
            const pad = (n: number) => String(n).padStart(2, "0");
            const toTimeStr = (mins: number) =>
                `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;

            const selectedService = activeServices.find(
                (s) => s._id === slotTemplate.serviceId,
            );
            const policySnapshot = JSON.stringify({
                ...slotTemplate,
                serviceName: selectedService?.title ?? "",
            });

            const locationMap = new Map(
                (locations ?? []).map((loc) => [loc._id as string, loc]),
            );
            const buildLocationSnapshot = (locId: string) => {
                const loc = locationMap.get(locId);
                if (!loc) return "{}";
                return JSON.stringify({
                    type: loc.type,
                    name: loc.name,
                    autoAddress: loc.autoAddress,
                    semiAddress: loc.semiAddress,
                    geo: { lat: loc.lat, lng: loc.lng },
                    details: loc.details,
                });
            };

            const slotRecords: Array<{
                locationId: Id<"Locations">;
                startAt: string;
                endAt: string;
                slotStatus: "open" | "closed";
                visibility: "public" | "unlisted" | "private";
                capacity: number;
                policySnapshot: string;
                locationSnapshot: string;
            }> = [];

            for (const dateSlot of dateTimeSlots) {
                if (!dateSlot.date) continue;
                for (const range of dateSlot.timeRanges) {
                    const startMin = parseTimeToMinutes(range.start);
                    const endMin = parseTimeToMinutes(range.end);
                    if (
                        Number.isNaN(startMin) ||
                        Number.isNaN(endMin) ||
                        startMin >= endMin
                    )
                        continue;

                    const locId = (range.locationId ||
                        defaultLocId) as Id<"Locations">;

                    let cursor = startMin;
                    while (cursor + duration <= endMin) {
                        const slotEnd = cursor + duration;
                        slotRecords.push({
                            locationId: locId,
                            startAt: `${dateSlot.date}T${toTimeStr(cursor)}:00`,
                            endAt: `${dateSlot.date}T${toTimeStr(slotEnd)}:00`,
                            slotStatus: "open",
                            visibility: slotTemplate.defaultVisibility,
                            capacity: slotTemplate.defaultCapacity,
                            policySnapshot,
                            locationSnapshot: buildLocationSnapshot(locId),
                        });
                        cursor = slotEnd + buffer;
                    }
                }
            }

            if (slotRecords.length === 0) {
                toast.error("作成する予約枠がありません");
                return;
            }

            setIsSubmitting(true);
            try {
                const ids = await createBatch({
                    tenantId: tenantId as Id<"Tenants">,
                    serviceId: slotTemplate.serviceId as Id<"Services">,
                    slots: slotRecords,
                });
                toast.success(`${ids.length}件の予約枠を作成しました`);
            } catch (e) {
                toast.error(
                    e instanceof Error
                        ? e.message
                        : "予約枠の作成に失敗しました",
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            crossFieldErrors,
            form,
            locations,
            createBatch,
            tenantId,
            activeServices,
        ],
    );

    // ─── ローディング ──────────────────────────────────────
    if (!tenant || services === undefined || locations === undefined) {
        return <CreateSlotSkeleton />;
    }

    // ─── レンダー ──────────────────────────────────────────
    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div>
                <div className="text-xl">予約枠作成</div>
                <p className="text-muted-foreground text-sm">
                    {tenant.tenantName} {tenant._id} の予約枠を新規作成します
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

                        <ServiceSelectField
                            control={form.control}
                            options={activeServices}
                        />
                        <LocationSelectField
                            control={form.control}
                            options={locations ?? []}
                        />
                        <VisibilitySelectField control={form.control} />

                        <DateTimeSlotsSection
                            control={form.control}
                            crossFieldErrors={crossFieldErrors}
                            locations={locations ?? []}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DurationInputField control={form.control} />
                            <CapacityInputField control={form.control} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <OpenBeforeInputField control={form.control} />
                            <CloseBeforeInputField control={form.control} />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <BufferInputField control={form.control} />
                            <DailyLimitInputField control={form.control} />
                        </div>

                        <FormQuestionsSection
                            control={form.control}
                            register={form.register}
                        />

                        <ReminderInputField control={form.control} />

                        <CancellationPolicySection control={form.control} />
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
                                            form.getValues(
                                                "slotTemplate.serviceId",
                                            ) ||
                                            activeServices[0]?._id ||
                                            "",
                                        defaultLocationId:
                                            form.getValues(
                                                "slotTemplate.defaultLocationId",
                                            ) ||
                                            locations?.[0]?._id ||
                                            "",
                                    },
                                    dateTimeSlots: [
                                        {
                                            date: getTodayYYYYMMDD(),
                                            timeRanges: [
                                                {
                                                    start: "09:00",
                                                    end: "10:00",
                                                    locationId: "",
                                                },
                                            ],
                                        },
                                    ],
                                })
                            }
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            form="form-slot-create"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "作成中…" : "作成する"}
                        </Button>
                    </Field>
                </form>
                <div>
                    <SlotCalender events={calendarEvents} tenantId={tenantId} />
                </div>
            </div>
        </div>
    );
}
