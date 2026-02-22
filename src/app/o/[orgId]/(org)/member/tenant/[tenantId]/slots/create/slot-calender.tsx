"use client";

// FullCalendar関連のインポート
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import { type DateClickArg } from "@fullcalendar/interaction";
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from "@fullcalendar/core/locales/ja";
import { toast } from "sonner";
import {
    EventSourceInput,
    EventMountArg,
    EventClickArg,
} from "@fullcalendar/core";

/**
 * 予約枠作成用のカレンダーコンポーネント
 */
const SlotCalender = () => {
    // 日付クリック時のハンドラー（空き枠をクリックした時）
    const handleDateClick = (arg: DateClickArg) => {
        toast.info(arg.dateStr);
        console.log(arg);
    };

    // イベント（予約枠）が描画された時のハンドラー
    const handleEventDidMount = (info: EventMountArg) => {
        // ステータスが "done" の場合は背景色を赤に変更
        if (info.event.extendedProps.status === "done") {
            info.el.style.backgroundColor = "red";

            // ドットマーカーの色を白に変更
            const dotEl: HTMLElement | null =
                info.el.querySelector(".fc-event-dot");
            if (dotEl) {
                dotEl.style.backgroundColor = "white";
            }
        }
    };

    // イベント（予約枠）クリック時のハンドラー
    const handleEventClick = (info: EventClickArg) => {
        toast.info(JSON.stringify(info.event, null, 2));
        console.log(info);
    };

    // 現在時刻
    const now = new Date();

    // 表示するイベント（予約枠）のデータ
    const events: EventSourceInput = [
        {
            title: "JST 14時 15:26:32.567",
            start: "2026-02-23T14:30:00+09:00",
            end: "2026-02-23T15:26:32.567+09:00",
        },
        {
            title: "JST 7時 start のみ",
            start: "2026-02-23T07:00:00+09:00",
            backgroundColor: "green",
            borderColor: "green",
        },
    ];

    return (
        <FullCalendar
            // 使用するプラグイン
            plugins={[
                dayGridPlugin, // 日付グリッド表示
                timeGridPlugin, // 時間グリッド表示
                interactionPlugin, // 日付クリックなどの操作
                listPlugin, // リスト表示
            ]}
            timeZone="local"
            initialView="timeGridFourDay" // 初期表示は4日間の時間グリッド
            headerToolbar={{
                left: "prev,next today", // 前へ・次へ・今日
                center: "title", // タイトル（年月日）
                right: "timeGridDay,timeGridFourDay,timeGridWeek,dayGridMonth,listWeek", // ビュー切り替えボタン
            }}
            views={{
                // カスタムビュー: 4日間の時間グリッド
                timeGridFourDay: {
                    type: "timeGrid",
                    duration: { days: 4 },
                    buttonText: "4日",
                },
            }}
            eventDidMount={handleEventDidMount} // イベント描画時の処理
            eventClick={handleEventClick} // イベントクリック時の処理
            dateClick={handleDateClick} // 日付クリック時の処理
            events={events} // 表示するイベントデータ
            locale={jaLocale} // 日本語ロケール
            nowIndicator={true} // 現在時刻のインジケーターを表示
            now={now} // 現在時刻
        />
    );
};

export default SlotCalender;
