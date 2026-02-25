"use client";

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
} from "@/app/o/[orgId]/(org)/(CUSTOMER)/_components/SlotResultList";
import { ArrowLeftIcon, SearchIcon, ShoppingBagIcon } from "lucide-react";

type Props = { orgId: string };

export function ServiceSearchPage({ orgId }: Props) {
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");

    const services = useQuery(api.services.listByOrg, {
        clerkOrgId: orgId,
    });

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
        api.slots.listAvailableByOrg,
        selectedServiceId
            ? { clerkOrgId: orgId, serviceId: selectedServiceId as Id<"Services"> }
            : "skip",
    );

    if (selectedServiceId) {
        const svc = services?.find((s) => s._id === selectedServiceId);
        return (
            <div className="mx-auto max-w-2xl py-10 px-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedServiceId(null)}
                    >
                        <ArrowLeftIcon className="size-4 mr-1" />
                        サービス一覧に戻る
                    </Button>
                </div>
                <div>
                    <h1 className="text-xl font-semibold">{svc?.title ?? "選択中"}</h1>
                    {svc && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {svc.tenantName}
                        </p>
                    )}
                </div>
                <SlotResultList
                    slots={slots as SlotResult[] | undefined}
                    orgId={orgId}
                    emptyMessage="このサービスでは予約可能な枠がありません"
                />
            </div>
        );
    }

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
                <h1 className="text-xl font-semibold">サービスから探す</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    サービスを選択すると予約可能な枠が表示されます
                </p>
            </div>

            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="サービス名・テナント名で検索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredServices === undefined ? (
                <div className="flex h-32 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                    読み込み中...
                </div>
            ) : filteredServices.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        該当するサービスがありません
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredServices.map((svc) => (
                        <Card
                            key={svc._id}
                            className="cursor-pointer transition-colors hover:bg-accent"
                            onClick={() => setSelectedServiceId(svc._id)}
                        >
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="font-medium text-sm">{svc.title}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {svc.tenantName}
                                        </div>
                                    </div>
                                    <ShoppingBagIcon className="size-4 text-muted-foreground shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
