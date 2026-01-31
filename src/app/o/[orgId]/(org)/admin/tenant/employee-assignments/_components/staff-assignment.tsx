"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** サーバーから渡すメンバー情報（Clerk の組織メンバーをシリアライズしたもの） */
export type MemberSummary = {
    userId: string;
    role: string;
    displayName: string;
    identifier: string;
    imageUrl?: string | null;
};

type StaffAssignmentProps = {
    orgId: string;
    members: MemberSummary[];
};

const roleLabelMap: Record<string, string> = {
    "org:admin": "Admin",
    "org:member": "Member",
};

export function StaffAssignment({ orgId, members }: StaffAssignmentProps) {
    const tenants = useQuery(api.tenants.listByOrg, {
        clerkOrgId: orgId,
        limit: 100,
    });
    const assignments = useQuery(api.tenantMemberAssignments.listByOrg, {
        clerkOrgId: orgId,
    });
    const setAssignmentsForMember = useMutation(
        api.tenantMemberAssignments.setAssignmentsForMember,
    );

    // clerkUserId -> Set<tenantId>
    const assignmentsByUser = React.useMemo(() => {
        const map = new Map<string, Set<string>>();
        if (!assignments) return map;
        for (const a of assignments) {
            const set = map.get(a.clerkUserId) ?? new Set<string>();
            set.add(a.tenantId);
            map.set(a.clerkUserId, set);
        }
        return map;
    }, [assignments]);

    // 各メンバーのローカル選択状態（未保存分）
    const [selected, setSelected] = React.useState<
        Record<string, Set<string>>
    >(() => ({}));
    const [savingUserId, setSavingUserId] = React.useState<string | null>(
        null,
    );

    const isSelected = (userId: string, tenantId: string) => {
        const local = selected[userId];
        if (local) return local.has(tenantId);
        return assignmentsByUser.get(userId)?.has(tenantId) ?? false;
    };

    const toggle = (userId: string, tenantId: string) => {
        setSelected((prev) => {
            const next = { ...prev };
            const set = new Set(next[userId] ?? assignmentsByUser.get(userId));
            if (set.has(tenantId)) {
                set.delete(tenantId);
            } else {
                set.add(tenantId);
            }
            next[userId] = set;
            return next;
        });
    };

    const saveForMember = async (userId: string) => {
        const raw =
            selected[userId] ?? assignmentsByUser.get(userId);
        const tenantIds = raw
            ? (Array.from(raw) as Id<"Tenants">[])
            : [];
        setSavingUserId(userId);
        try {
            await setAssignmentsForMember({
                clerkOrgId: orgId,
                clerkUserId: userId,
                tenantIds,
            });
            setSelected((prev) => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
            toast("割当を保存しました", { position: "bottom-right" });
        } catch (e) {
            const message =
                e instanceof Error ? e.message : "Unknown error";
            toast("保存に失敗しました", {
                description: message,
                position: "bottom-right",
            });
        } finally {
            setSavingUserId(null);
        }
    };

    const isLoading = tenants === undefined || assignments === undefined;

    if (isLoading) {
        return (
            <section className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Spinner />
                    <span>読み込み中...</span>
                </div>
            </section>
        );
    }

    const tenantList = tenants ?? [];

    return (
        <section className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold">
                    各テナントへ従業員振り分け
                </h2>
                <p className="text-sm text-muted-foreground">
                    組織の Admin / Member をテナントに割り当てます。1人を複数テナントに割り当て可能です。
                </p>
            </div>

            {members.length === 0 ? (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>従業員が見つかりません</CardTitle>
                        <CardDescription>
                            組織に Admin / Member がまだいないようです。「1. 従業員へ昇格する」で Member に昇格させてから振り分けてください。
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : tenantList.length === 0 ? (
                <Card className="border-dashed">
                    <CardHeader>
                        <CardTitle>テナントがありません</CardTitle>
                        <CardDescription>
                            先にテナントを作成してから、従業員を割り当ててください。
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="space-y-4">
                    {members.map((member) => {
                        const roleLabel =
                            roleLabelMap[member.role] ?? member.role;
                        const initials = (member.displayName || member.identifier || "?")
                            .slice(0, 2)
                            .toUpperCase();
                        const isSaving = savingUserId === member.userId;

                        return (
                            <Card key={member.userId}>
                                <CardHeader className="gap-2">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage
                                                    src={
                                                        member.imageUrl ?? ""
                                                    }
                                                    alt={member.displayName}
                                                />
                                                <AvatarFallback>
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {member.displayName || "名前なし"}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {member.identifier}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {roleLabel}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                disabled={isSaving}
                                                onClick={() =>
                                                    saveForMember(member.userId)
                                                }
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Spinner />
                                                        保存中...
                                                    </>
                                                ) : (
                                                    "割当を保存"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        割り当てるテナントにチェックを入れて「割当を保存」を押してください。
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {tenantList.map((tenant) => {
                                            const checked = isSelected(
                                                member.userId,
                                                tenant._id,
                                            );
                                            return (
                                                <label
                                                    key={tenant._id}
                                                    className="flex cursor-pointer items-center gap-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() =>
                                                            toggle(
                                                                member.userId,
                                                                tenant._id,
                                                            )
                                                        }
                                                        className={cn(
                                                            "size-4 shrink-0 rounded border-input",
                                                        )}
                                                    />
                                                    <span className="text-base font-medium">
                                                        {tenant.tenantName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        /{tenant.tenantSlug}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
