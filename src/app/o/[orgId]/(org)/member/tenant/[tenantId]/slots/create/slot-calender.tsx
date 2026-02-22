"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { type DateClickArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import { toast } from "sonner";
import type { EventSourceInput, EventClickArg, EventContentArg } from "@fullcalendar/core";

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
};

/**
 * 予約枠プレビュー用カレンダー。
 * createSlot から渡された events をそのまま FullCalendar に表示する。
 */
const SlotCalender = ({ events = [] }: SlotCalenderProps) => {
    const handleDateClick = (arg: DateClickArg) => {
        toast.info(arg.dateStr);
    };

    const handleEventClick = (info: EventClickArg) => {
        toast.info(JSON.stringify(info.event, null, 2));
    };

    const renderEventContent = (arg: EventContentArg) => {
        const locName = arg.event.extendedProps?.locationName as string | undefined;
        return (
            <div className="overflow-hidden px-0.5 leading-tight">
                <div className="font-medium">{arg.event.title}</div>
                {locName && (
                    <div className="text-[10px] opacity-80 truncate">{locName}</div>
                )}
            </div>
        );
    };

    const calendarEvents: EventSourceInput = events;

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
            events={calendarEvents}
            locale={jaLocale}
            nowIndicator={true}
            now={new Date()}
        />
    );
};

export default SlotCalender;
