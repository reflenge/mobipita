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
        <div className="mx-auto max-w-2xl py-10 px-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">予約</h1>
                <p className="text-sm text-muted-foreground mt-1">
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
                            <Card className="transition-all hover:shadow-md hover:border-foreground/20 group">
                                <CardContent className="flex items-center gap-4 py-5 px-5">
                                    <div className={`rounded-xl p-3 ${route.bg}`}>
                                        <Icon className={`size-6 ${route.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-base">
                                            {route.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-0.5">
                                            {route.description}
                                        </div>
                                    </div>
                                    <ChevronRightIcon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
