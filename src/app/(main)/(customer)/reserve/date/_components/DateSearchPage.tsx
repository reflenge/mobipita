"use client";

/**
 * DateSearchPage コンポーネント (日付から探す)
 *
 * 役割: Date Picker (input type="date") を提供し、選択された日付に基づいて
 * 該当日のすべての予約可能枠（Slot）を検索し、SlotResultList 経由で一覧表示する。
 * state として選択中日付（selectedDate）を管理し、API (slots.listAvailable) に渡す。
 */
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/link";
import {
    SlotResultList,
    type SlotResult,
} from "@/app/(main)/(customer)/_components/SlotResultList";
import { ArrowLeftIcon } from "lucide-react";

function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateSearchPage() {
    const [selectedDate, setSelectedDate] = useState(todayStr());

    const slots = useQuery(api.slots.listAvailable, {
        date: selectedDate,
    });

    return (
        <div className="mx-auto max-w-2xl space-y-4 px-6 py-10">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                        <ArrowLeftIcon className="mr-1 size-4" />
                        トップへ戻る
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-semibold">日付から探す</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">
                    日付を選択すると、その日の予約可能枠が表示されます
                </p>
            </div>

            <div>
                <Input
                    type="date"
                    value={selectedDate}
                    min={todayStr()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-52"
                />
            </div>

            <SlotResultList
                slots={slots as SlotResult[] | undefined}
                emptyMessage="この日付には予約可能な枠がありません"
            />
        </div>
    );
}
