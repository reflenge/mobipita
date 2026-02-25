"use client";

/**
 * BookingSearch コンポーネント (トップページ内)
 *
 * 役割: 「場所から探す」「日付から探す」「サービスから探す」の3つの検索ルートコンポーネントを描画する。
 * 各項目は Card コンポーネントでラップされ、クリック時にそれぞれの予約フロー画面へ遷移させる。
 */
import { Card, CardContent } from "@/components/ui/card";

import { Link } from "@/components/link";
import {
    CalendarIcon,
    MapPinIcon,
    ShoppingBagIcon,
    ChevronRightIcon,
    StoreIcon,
} from "lucide-react";

type Props = { orgId: string };

const SEARCH_ROUTES = [
    {
        href: (orgId: string) => `/o/${orgId}/reserve/tenant`,
        icon: StoreIcon,
        title: "テナントから探す",
        description: "店舗や出店者を選んで、予約可能な枠を表示します",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
        href: (orgId: string) => `/o/${orgId}/reserve/location`,
        icon: MapPinIcon,
        title: "場所から探す",
        description: "店舗や拠点を選んで、予約可能な枠を表示します",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
        href: (orgId: string) => `/o/${orgId}/reserve/date`,
        icon: CalendarIcon,
        title: "日付から探す",
        description: "日付を指定して、すべての予約可能枠を検索します",
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
        href: (orgId: string) => `/o/${orgId}/reserve/service`,
        icon: ShoppingBagIcon,
        title: "サービスから探す",
        description: "サービスを選んで、予約可能な枠を表示します",
        color: "text-violet-500",
        bg: "bg-violet-50 dark:bg-violet-950/30",
    },
] as const;

export function BookingSearch({ orgId }: Props) {
    return (
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
            <div>
                <h1 className="text-2xl font-semibold">予約</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    検索方法を選んで、予約枠を探しましょう
                </p>
            </div>

            <div className="grid gap-4">
                {SEARCH_ROUTES.map((route) => {
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.title}
                            href={route.href(orgId)}
                            className="block"
                        >
                            <Card className="hover:border-foreground/20 group transition-all hover:shadow-md">
                                <CardContent className="flex items-center gap-4 px-5 py-5">
                                    <div
                                        className={`rounded-xl p-3 ${route.bg}`}
                                    >
                                        <Icon
                                            className={`size-6 ${route.color}`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-base font-semibold">
                                            {route.title}
                                        </div>
                                        <div className="text-muted-foreground mt-0.5 text-sm">
                                            {route.description}
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
