"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import CreateSlotSkeleton from "./createSlotSkeleton";
import SlotCalender from "./slot-calender";
import { getTodayYYYYMMDD } from "./dateUtils";
import {
    formSchema,
    type FormValues,
    DEFAULT_SLOT_TEMPLATE,
} from "./schema";
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

type Props = {
    orgId: string;
    tenantId: string;
};

export function CreateSlot({ orgId, tenantId }: Props) {
    const tenant = useQuery(api.tenants.getByIdInOrg, {
        clerkOrgId: orgId,
        tenantId: tenantId as Id<"Tenants">,
    });

    const services = useQuery(api.services.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
    });
    const activeServices = useMemo(
        () => services?.filter((service) => service.isActive) ?? [],
        [services]
    );

    const locations = useQuery(api.locations.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
    });

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
                        { id: "q_question1", label: "<p>質問1</p>", type: "textarea", required: false },
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
                    timeRanges: [{ start: "09:00", end: "14:00" }],
                },
            ],
        },
        mode: "all",
    });

    useEffect(() => {
        const subscription = form.watch((data) => {
            console.log("form data:", data);
        });
        return () => subscription.unsubscribe();
    }, [form]);

    useEffect(() => {
        if (tenant) {
            if (!form.getValues("slotTemplate.serviceId") && activeServices[0]) {
                form.setValue("slotTemplate.tenantId", tenantId);
                form.setValue("slotTemplate.serviceId", activeServices[0]._id);
            }
            if (
                !form.getValues("slotTemplate.defaultLocationId") &&
                locations?.[0]
            ) {
                form.setValue(
                    "slotTemplate.defaultLocationId",
                    locations[0]._id
                );
            }
        }
    }, [tenant, tenantId, form, activeServices, locations]);

    function onSubmit(data: FormValues) {
        console.log("🚀 => onSubmit => data:", data);
        toast(
            <pre className="bg-code text-code-foreground w-[520px] overflow-x-auto">
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
        );
    }

    if (!tenant || services === undefined || locations === undefined) {
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

                        <DateTimeSlotsSection control={form.control} />

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
                                            form.getValues("slotTemplate.serviceId") ||
                                            activeServices[0]?._id ||
                                            "",
                                        defaultLocationId:
                                            form.getValues(
                                                "slotTemplate.defaultLocationId"
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
                                                },
                                            ],
                                        },
                                    ],
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
                <div>
                    <SlotCalender />
                </div>
            </div>
        </div>
    );
}
