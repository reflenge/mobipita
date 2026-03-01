"use client";

/**
 * 会社管理：顧客詳細コンポーネント
 * 顧客のプロフィール表示・スタッフメモ編集・スタッフタグの付与を行う。
 * Convex の userProfiles / staffTags と連携する。
 */
import * as React from "react";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { RoleChangeDialog } from "../../../_components/RoleChangeDialog";
import { TenantAssignDialog } from "../../../_components/TenantAssignDialog";
import { CustomerMemoCard } from "./CustomerMemoCard";
import { ProfileCard } from "./ProfileCard";
import { StaffMemoCard } from "./StaffMemoCard";
import { StaffTagsCard, type StaffTagItem } from "./StaffTagsCard";
import type { CustomerDetailProps } from "./types";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type { UserInfo } from "./types";

export function CustomerDetail({
    user,
    availableRoles,
    currentUserId,
}: CustomerDetailProps) {
    const profile = useQuery(api.userProfiles.getByUserId, {
        clerkUserId: user.userId,
    });
    const allTags = useQuery(api.staffTags.list);
    const tenants = useQuery(api.tenants.list, { limit: 100 });
    const memberTenants = useQuery(api.tenantMemberAssignments.listByMember, {
        clerkUserId: user.userId,
    });

    const [showRoleDialog, setShowRoleDialog] = React.useState(false);
    const [showTenantDialog, setShowTenantDialog] = React.useState(false);

    const assignedTenantNames = React.useMemo(() => {
        if (!tenants || !memberTenants) return [];
        const tenantMap = new Map(tenants.map((t) => [t._id, t.tenantName]));
        return memberTenants
            .map((id) => tenantMap.get(id))
            .filter((name): name is string => !!name);
    }, [tenants, memberTenants]);

    const isLoading = profile === undefined || allTags === undefined;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    const allTagsList = allTags as StaffTagItem[] | undefined;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/company/users">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">
                    顧客詳細
                </h1>
            </div>

            <ProfileCard
                user={user}
                assignedTenantNames={assignedTenantNames}
                onOpenRoleDialog={() => setShowRoleDialog(true)}
                onOpenTenantDialog={() => setShowTenantDialog(true)}
            />

            <CustomerMemoCard customerMemo={profile?.customerMemo ?? ""} />

            <StaffMemoCard
                clerkUserId={user.userId}
                initialMemo={profile?.staffMemo ?? ""}
            />

            <StaffTagsCard
                clerkUserId={user.userId}
                initialTagIds={profile?.staffTags ?? []}
                allTags={allTagsList}
            />

            <RoleChangeDialog
                open={showRoleDialog}
                onOpenChange={setShowRoleDialog}
                user={{
                    userId: user.userId,
                    displayName: user.displayName,
                    identifier: user.email,
                    imageUrl: user.imageUrl,
                    role: user.role ?? "customer",
                }}
                availableRoles={availableRoles}
                isSelf={user.userId === currentUserId}
            />

            <TenantAssignDialog
                open={showTenantDialog}
                onOpenChange={setShowTenantDialog}
                user={{
                    userId: user.userId,
                    displayName: user.displayName,
                    imageUrl: user.imageUrl,
                }}
            />
        </div>
    );
}
