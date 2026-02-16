"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuBadge
} from "@/components/ui/sidebar";
import { CalendarPlus, Home, MapPin, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type MemberTenantListProps = {
    orgId: string;
    userId: string;
};

/**
 * Member サイドバー内の「Tenant」メニューと、割当テナント一覧（sub）を表示するコンポーネント。
 * 各テナントのアイコン部分にロゴ画像を表示する（未設定の場合は Store アイコン）。
 */
export function MemberTenantList({ orgId, userId }: MemberTenantListProps) {
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

    return (
        <>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href={`/o/${orgId}/member`}>
                        <Store />
                        <span>Tenant</span>
                    </Link>
                </SidebarMenuButton>

                {
                    myTenants.length > 0 && (
                        myTenants.map((tenant) => {
                            const logoUrl =
                                tenant.tenantLogoFileId && logoUrls
                                    ? logoUrls[tenant.tenantLogoFileId]
                                    : null;
                            return (
                                <SidebarMenuSub key={tenant._id}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href={`/o/${orgId}/member/tenant/${tenant._id}`}
                                            >
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt=""
                                                        className={cn(
                                                            "size-5 shrink-0 rounded object-cover",
                                                        )}
                                                    />
                                                ) : (
                                                    <Store className="size-5 shrink-0" />
                                                )}
                                                <span>{tenant.tenantName}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuButton asChild>
                                                    <Link
                                                        href={`/o/${orgId}/member/tenant/${tenant._id}`}
                                                    >
                                                        <Home className="size-4" />
                                                        <span>店舗トップ</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuButton asChild>
                                                    <Link
                                                        href={`/o/${orgId}/member/tenant/${tenant._id}/services`}
                                                    >
                                                        <CalendarPlus className="size-4" />
                                                        <span>サービス管理</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuButton asChild>
                                                    <Link
                                                        href={`/o/${orgId}/member/tenant/${tenant._id}/locations`}
                                                    >
                                                        <MapPin className="size-4" />
                                                        <span>場所管理</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuButton asChild>
                                                    <Link
                                                        href={`/o/${orgId}/member/tenant/${tenant._id}/slots`}
                                                    >
                                                        <CalendarPlus className="size-4" />
                                                        <span>予約枠管理</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </SidebarMenuItem>
                                </SidebarMenuSub>
                            );
                        })
                    )
                }
            </SidebarMenuItem>
        </>
    );
}
