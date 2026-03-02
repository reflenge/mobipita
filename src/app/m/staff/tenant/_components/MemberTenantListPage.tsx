"use client";

import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowRight, CalendarPlus, Home, MapPin, Store } from "lucide-react";
import Image from "next/image";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberTenantListPage() {
    const { user } = useUser();
    const userId = user?.id;

    const assignedTenantIds = useQuery(
        api.tenantMemberAssignments.listByMember,
        userId ? { clerkUserId: userId } : "skip",
    );
    const allTenants = useQuery(api.tenants.list, { limit: 100 });

    const myTenants = useMemo(() => {
        if (!allTenants || !assignedTenantIds) return [];
        const idSet = new Set(assignedTenantIds);
        return allTenants.filter((t) => idSet.has(t._id));
    }, [allTenants, assignedTenantIds]);

    const logoFileIds = useMemo(
        () =>
            myTenants
                .map((t) => t.tenantLogoFileId)
                .filter((id): id is Id<"Files"> => id != null),
        [myTenants],
    );
    const logoUrls = useQuery(
        api.files.getStorageUrls,
        logoFileIds.length > 0 ? { fileIds: logoFileIds } : "skip",
    );

    const isLoading =
        assignedTenantIds === undefined || allTenants === undefined;

    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div>
                <h1 className="text-2xl font-semibold">テナント管理</h1>
                <p className="text-muted-foreground text-sm">
                    担当テナントの一覧と各管理機能
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i}>
                            <div className="mb-4 flex items-center gap-3">
                                <Skeleton className="size-9 rounded-full" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-5 w-36" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Card key={j}>
                                        <CardContent className="flex flex-col gap-3 pt-5">
                                            <Skeleton className="size-10 rounded-lg" />
                                            <div className="space-y-1.5">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-32" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : myTenants.length === 0 ? (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>担当テナントがありません</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            管理者にテナントの割り当てを依頼してください。
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {myTenants.map((tenant) => {
                        const logoUrl =
                            tenant.tenantLogoFileId && logoUrls
                                ? logoUrls[tenant.tenantLogoFileId]
                                : null;
                        const basePath = `/m/staff/tenant/${tenant._id}`;

                        const features = [
                            {
                                href: basePath,
                                icon: Home,
                                label: "店舗トップ",
                                description: "店舗情報の確認",
                            },
                            {
                                href: `${basePath}/services`,
                                icon: CalendarPlus,
                                label: "サービス管理",
                                description: "提供サービスの設定",
                            },
                            {
                                href: `${basePath}/locations`,
                                icon: MapPin,
                                label: "場所管理",
                                description: "店舗・施設の管理",
                            },
                            {
                                href: `${basePath}/slots`,
                                icon: CalendarPlus,
                                label: "予約枠管理",
                                description: "予約枠の作成・管理",
                            },
                        ];

                        return (
                            <section key={tenant._id}>
                                <Link
                                    href={basePath}
                                    className="group mb-4 flex items-center gap-3"
                                >
                                    {logoUrl ? (
                                        <Image
                                            src={logoUrl}
                                            alt=""
                                            width={36}
                                            height={36}
                                            className="ring-border size-9 shrink-0 rounded-full object-cover ring-2"
                                        />
                                    ) : (
                                        <div className="bg-muted ring-border flex size-9 shrink-0 items-center justify-center rounded-full ring-2">
                                            <Store className="text-muted-foreground size-4" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-semibold underline-offset-2 group-hover:underline">
                                            {tenant.tenantName}
                                        </h2>
                                    </div>
                                </Link>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {features.map((f) => (
                                        <Link
                                            key={f.href}
                                            href={f.href}
                                            className="group/card"
                                        >
                                            <Card className="group-hover/card:border-primary/40 group-hover/card:bg-accent/50 h-full transition-colors">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between gap-2">
                                                        <f.icon className="size-5" />
                                                        {f.label}
                                                        <ArrowRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover/card:translate-x-0 group-hover/card:opacity-100" />
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {f.description}
                                                    </CardDescription>
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
