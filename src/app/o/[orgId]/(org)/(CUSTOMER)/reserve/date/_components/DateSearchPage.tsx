"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/link";
import {
    SlotResultList,
    type SlotResult,
} from "@/app/o/[orgId]/(org)/(CUSTOMER)/_components/SlotResultList";
import { ArrowLeftIcon } from "lucide-react";

type Props = { orgId: string };

function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DateSearchPage({ orgId }: Props) {
    const [selectedDate, setSelectedDate] = useState(todayStr());

    const slots = useQuery(api.slots.listAvailableByOrg, {
        clerkOrgId: orgId,
        date: selectedDate,
    });

    return (
        <div className="mx-auto max-w-2xl py-10 px-6 space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/o/${orgId}`}>
                        <ArrowLeftIcon className="size-4 mr-1" />
                        トップへ戻る
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-semibold">日付から探す</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
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
                orgId={orgId}
                emptyMessage="この日付には予約可能な枠がありません"
            />
        </div>
    );
}
