"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CalendarPlus, Home, MapPin, Store } from "lucide-react";

type Props = {
    orgId: string;
};

export function MemberTenantListPage({ orgId }: Props) {
    const { user } = useUser();
    const userId = user?.id;

    const assignedTenantIds = useQuery(
        api.tenantMemberAssignments.listByMember,
        userId && orgId
            ? { clerkOrgId: orgId, clerkUserId: userId }
            : "skip",
    );
    const allTenants = useQuery(
        api.tenants.listByOrg,
        orgId ? { clerkOrgId: orgId, limit: 100 } : "skip",
    );

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

    const isLoading = assignedTenantIds === undefined || allTenants === undefined;

    return (
        <div className="mx-auto container px-6 py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">テナント管理</h1>
                <p className="text-sm text-muted-foreground">
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
                        <p className="text-sm text-muted-foreground">
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
                        const basePath = `/o/${orgId}/member/tenant/${tenant._id}`;

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
                                        <img
                                            src={logoUrl}
                                            alt=""
                                            className="size-9 shrink-0 rounded-full object-cover ring-2 ring-border"
                                        />
                                    ) : (
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-border">
                                            <Store className="size-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-semibold truncate group-hover:underline underline-offset-2">
                                            {tenant.tenantName}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            /{tenant.tenantSlug}
                                        </p>
                                    </div>
                                </Link>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {features.map((f) => (
                                        <Link key={f.href} href={f.href} className="group/card">
                                            <Card className="h-full transition-colors group-hover/card:border-primary/40 group-hover/card:bg-accent/50">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between gap-2">
                                                        <f.icon className="size-5" />
                                                        {f.label}
                                                        <ArrowRight className="size-3 opacity-0 -translate-x-1 transition-all group-hover/card:opacity-100 group-hover/card:translate-x-0" />
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {f.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                {/* <CardContent className="">
                                                </CardContent> */}
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
