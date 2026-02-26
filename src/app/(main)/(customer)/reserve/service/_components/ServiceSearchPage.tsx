"use client";

/**
 * ServiceSearchPage コンポーネント (サービスから探す)
 *
 * 役割: キーワード（サービス名やテナント名）でサービス一覧を絞り込み表示し、
 * ユーザーが特定のサービスを選択した際に、そのサービスに紐づく予約可能枠を
 * 一覧で表示する (SlotResultListを利用)。
 */
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/link";
import {
    SlotResultList,
    type SlotResult,
} from "@/app/(main)/(customer)/_components/SlotResultList";
import { ArrowLeftIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";

export function ServiceSearchPage() {
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
        null,
    );
    const [keyword, setKeyword] = useState("");

    const services = useQuery(api.services.listAll, {});

    const filteredServices = useMemo(() => {
        if (!services) return undefined;
        const q = keyword.trim().toLowerCase();
        if (!q) return services;
        return services.filter(
            (svc) =>
                svc.title.toLowerCase().includes(q) ||
                svc.tenantName.toLowerCase().includes(q),
        );
    }, [services, keyword]);

    const slots = useQuery(
        api.slots.listAvailable,
        selectedServiceId
            ? {
                  serviceId: selectedServiceId as Id<"Services">,
              }
            : "skip",
    );

    if (selectedServiceId) {
        const svc = services?.find((s) => s._id === selectedServiceId);
        return (
            <div className="mx-auto max-w-2xl space-y-4 px-6 py-10">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedServiceId(null)}
                    >
                        <ArrowLeftIcon className="mr-1 size-4" />
                        サービス一覧に戻る
                    </Button>
                </div>
                <div>
                    <h1 className="text-xl font-semibold">
                        {svc?.title ?? "選択中"}
                    </h1>
                    {svc && (
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            {svc.tenantName}
                        </p>
                    )}
                </div>
                <SlotResultList
                    slots={slots as SlotResult[] | undefined}
                    emptyMessage="このサービスでは予約可能な枠がありません"
                />
            </div>
        );
    }

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
                <h1 className="text-xl font-semibold">サービスから探す</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">
                    サービスを選択すると予約可能な枠が表示されます
                </p>
            </div>

            <div className="relative">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    type="search"
                    placeholder="サービス名・テナント名で検索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredServices === undefined ? (
                <div className="bg-muted text-muted-foreground flex h-32 items-center justify-center rounded-md border text-sm">
                    読み込み中...
                </div>
            ) : filteredServices.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground py-8 text-center">
                        該当するサービスがありません
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredServices.map((svc) => (
                        <Card
                            key={svc._id}
                            className="hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => setSelectedServiceId(svc._id)}
                        >
                            <CardContent className="px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="text-sm font-medium">
                                            {svc.title}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {svc.tenantName}
                                        </div>
                                    </div>
                                    <ShoppingBagIcon className="text-muted-foreground size-4 shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
