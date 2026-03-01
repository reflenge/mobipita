"use client";

import { useMemo, useState } from "react";
import jaLocale from "@fullcalendar/core/locales/ja";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useQuery } from "convex/react";
import { SlotDetailDialog, type SlotData } from "./SlotDetailDialog";
import type { Id } from "@/../convex/_generated/dataModel";
import type {
    EventClickArg,
    EventContentArg,
    EventInput,
} from "@fullcalendar/core";
import { api } from "@/../convex/_generated/api";

const STATUS_COLOR: Record<string, string> = {
    open: "#2563eb",
    closed: "#94a3b8",
};

const VISIBILITY_LABEL: Record<string, string> = {
    public: "公開",
    unlisted: "限定公開",
    private: "非公開",
};

type Props = {
    tenantId: string;
};

export function SlotListCalendar({ tenantId }: Props) {
    const slots = useQuery(api.slots.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
        limit: 500,
    });

    const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const enrichedSlots: SlotData[] = useMemo(
        () =>
            (slots ?? []).map((s) => ({
                ...s,
                policy: safeParse(s.policySnapshot),
                location: safeParse(s.locationSnapshot),
            })),
        [slots],
    );

    const events: EventInput[] = useMemo(
        () =>
            enrichedSlots.map((s) => ({
                id: s._id,
                title: s.serviceName,
                start: s.startAt,
                end: s.endAt,
                backgroundColor: STATUS_COLOR[s.slotStatus] ?? "#2563eb",
                borderColor: STATUS_COLOR[s.slotStatus] ?? "#2563eb",
                textColor: "#fff",
                display: "auto",
                extendedProps: {
                    slotId: s._id,
                    locationName: s.locationName,
                    capacity: s.capacity,
                    slotStatus: s.slotStatus,
                    visibility: s.visibility,
                    serviceName: s.serviceName,
                },
            })),
        [enrichedSlots],
    );

    const handleEventClick = (info: EventClickArg) => {
        const slotId = info.event.extendedProps.slotId as string;
        const found = enrichedSlots.find((s) => s._id === slotId);
        if (found) {
            setSelectedSlot(found);
            setDialogOpen(true);
        }
    };

    const renderEventContent = (arg: EventContentArg) => {
        const {
            locationName,
            capacity,
            slotStatus: status,
            visibility,
        } = arg.event.extendedProps as Record<string, string>;
        const timeText = arg.timeText;
        return (
            <div className="overflow-hidden px-1 py-0.5 text-xs leading-tight">
                <div className="truncate font-semibold">{arg.event.title}</div>
                <div className="opacity-90">{timeText}</div>
                {locationName && (
                    <div className="truncate opacity-80">{locationName}</div>
                )}
                <div className="mt-0.5 flex flex-wrap gap-1">
                    <span className="rounded bg-white/20 px-1">
                        定員{capacity}
                    </span>
                    <span className="rounded bg-white/20 px-1">
                        {status === "open" ? "受付中" : "締切"}
                    </span>
                    <span className="rounded bg-white/20 px-1">
                        {VISIBILITY_LABEL[visibility] ?? visibility}
                    </span>
                </div>
            </div>
        );
    };

    if (slots === undefined) {
        return (
            <div className="bg-muted text-muted-foreground flex h-64 items-center justify-center rounded-md border text-sm">
                読み込み中…
            </div>
        );
    }

    return (
        <>
            <FullCalendar
                plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    listPlugin,
                ]}
                timeZone="local"
                initialView="timeGridWeek"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridDay,timeGridWeek,dayGridMonth,listWeek",
                }}
                eventDisplay="auto"
                eventColor="#2563eb"
                eventTextColor="#fff"
                displayEventTime={true}
                displayEventEnd={true}
                eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                events={events}
                locale={jaLocale}
                nowIndicator={true}
                now={new Date()}
                height="auto"
                eventOrder="start"
            />
            <SlotDetailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                slot={selectedSlot}
            />
        </>
    );
}

function safeParse(json: string): Record<string, unknown> {
    try {
        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return {};
    }
}
