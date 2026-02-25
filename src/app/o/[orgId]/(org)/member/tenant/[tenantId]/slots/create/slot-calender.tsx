"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { subWeeks, format } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { type DateClickArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import { toast } from "sonner";
import type { EventInput, EventClickArg, EventContentArg } from "@fullcalendar/core";

/** createSlot の useMemo で生成され、カレンダーに渡されるイベント1件の型 */
export type SlotEvent = {
    title: string;
    start: string;   // ISO 8601（例: "2026-02-22T09:00:00"）
    end: string;
    backgroundColor?: string;
    borderColor?: string;
    extendedProps?: Record<string, unknown>;
};

type SlotCalenderProps = {
    /** 表示する予約枠イベントの配列。フォームデータから動的に生成される */
    events?: SlotEvent[];
    /** 既存スロットを背景に表示するためのテナントID */
    tenantId?: string;
};

/**
 * 予約枠プレビュー用カレンダー。
 * createSlot から渡された events（新規プレビュー）を通常表示し、
 * tenantId が指定されている場合は保存済みスロットを薄く背景表示する。
 */
const SlotCalender = ({ events = [], tenantId }: SlotCalenderProps) => {
    const fromDate = useMemo(
        () => format(subWeeks(new Date(), 1), "yyyy-MM-dd"),
        [],
    );
    const existingSlots = useQuery(
        api.slots.listByTenant,
        tenantId ? { tenantId: tenantId as Id<"Tenants">, limit: 500, from: fromDate } : "skip",
    );

    const existingEvents = useMemo((): EventInput[] => {
        if (!existingSlots) return [];
        return existingSlots.map((s) => ({
            id: `existing-${s._id}`,
            title: s.serviceName,
            start: s.startAt,
            end: s.endAt,
            backgroundColor: "#94a3b8",
            borderColor: "#94a3b8",
            textColor: "#fff",
            extendedProps: {
                existing: true,
                locationName: s.locationName,
                slotStatus: s.slotStatus,
                capacity: s.capacity,
                visibility: s.visibility,
            },
        }));
    }, [existingSlots]);

    const mergedEvents = useMemo((): EventInput[] => {
        return [...existingEvents, ...events];
    }, [existingEvents, events]);

    const handleDateClick = (arg: DateClickArg) => {
        const view = false;
        if (!view) {
            return;
        }
        toast.info(arg.dateStr);
    };

    const VISIBILITY_LABEL: Record<string, string> = {
        public: "公開",
        unlisted: "限定公開",
        private: "非公開",
    };
    const STATUS_LABEL: Record<string, string> = {
        open: "受付中",
        closed: "締切",
    };

    const formatEventTime = (date: Date | null) =>
        date ? date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";

    const handleEventClick = (info: EventClickArg) => {
        const ev = info.event;
        const ext = ev.extendedProps;
        const timeStr = `${formatEventTime(ev.start)}〜${formatEventTime(ev.end)}`;

        if (ext.existing) {
            const status = STATUS_LABEL[ext.slotStatus as string] ?? ext.slotStatus;
            const vis = VISIBILITY_LABEL[ext.visibility as string] ?? ext.visibility;
            toast.info(`📋 保存済み枠`, {
                description: [
                    `${ev.title}`,
                    `${timeStr}`,
                    ext.locationName && `📍 ${ext.locationName}`,
                    `定員 ${ext.capacity}名 ／ ${status} ／ ${vis}`,
                ].filter(Boolean).join("\n"),
                duration: 4000,
            });
        } else {
            toast.info(`🆕 新規プレビュー枠`, {
                description: [
                    timeStr,
                    ext.locationName && `📍 ${ext.locationName}`,
                ].filter(Boolean).join("\n"),
                duration: 3000,
            });
        }
    };

    const renderEventContent = (arg: EventContentArg) => {
        const isExisting = arg.event.extendedProps?.existing as boolean | undefined;
        const locName = arg.event.extendedProps?.locationName as string | undefined;

        if (isExisting) {
            return (
                <div className="overflow-hidden px-0.5 leading-tight opacity-50">
                    <div className="text-[10px] font-medium">{arg.event.title}</div>
                    {locName && (
                        <div className="text-[9px] truncate">{locName}</div>
                    )}
                </div>
            );
        }

        return (
            <div className="overflow-hidden px-0.5 leading-tight">
                <div className="font-medium">{arg.event.title}</div>
                {locName && (
                    <div className="text-[10px] opacity-80 truncate">{locName}</div>
                )}
            </div>
        );
    };

    return (
        <FullCalendar
            plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
            ]}
            timeZone="local"
            initialView="timeGridFourDay"
            headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridDay,timeGridFourDay,timeGridWeek,dayGridMonth,listWeek",
            }}
            views={{
                timeGridFourDay: {
                    type: "timeGrid",
                    duration: { days: 4 },
                    buttonText: "4日",
                },
            }}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            dateClick={handleDateClick}
            events={mergedEvents}
            locale={jaLocale}
            nowIndicator={true}
            now={new Date()}
        />
    );
};

export default SlotCalender;
