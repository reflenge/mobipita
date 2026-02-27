"use client";

/**
 * 会社管理：個人テナント割当 UI
 * 指定ユーザーに割り当てるテナントを Switch で選択し、Convex の setAssignmentsForMember で保存する。
 */
import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Check, Store, Loader2 } from "lucide-react";
import { Link } from "@/components/link";
import { cn } from "@/lib/utils";

type PersonalAssignmentProps = {
    userId: string;
    displayName: string;
    imageUrl: string | null;
};

export function PersonalAssignment({
    userId,
    displayName,
    imageUrl,
}: PersonalAssignmentProps) {
    const tenants = useQuery(api.tenants.list, { limit: 100 });
    const memberTenants = useQuery(api.tenantMemberAssignments.listByMember, {
        clerkUserId: userId,
    });
    const setAssignments = useMutation(
        api.tenantMemberAssignments.setAssignmentsForMember,
    );

    const [selected, setSelected] = React.useState<Set<string> | null>(null);
    const [isPending, startTransition] = React.useTransition();

    // Convex から取得した割当でローカル state を初期化（未初期化時のみ）
    React.useEffect(() => {
        if (memberTenants && selected === null) {
            setSelected(new Set(memberTenants));
        }
    }, [memberTenants, selected]);

    const isLoading =
        tenants === undefined || memberTenants === undefined || selected === null;

    if (isLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full rounded-xl" />
            </div>
        );
    }

    const currentSet = new Set(memberTenants ?? []);
    const isDirty =
        selected!.size !== currentSet.size ||
        [...selected!].some((id) => !currentSet.has(id as Id<"Tenants">));

    /** テナントのオン/オフをトグル */
    function toggle(tenantId: string) {
        setSelected((prev) => {
            const next = new Set(prev!);
            if (next.has(tenantId)) {
                next.delete(tenantId);
            } else {
                next.add(tenantId);
            }
            return next;
        });
    }

    /** 選択中のテナント割当を Convex に保存 */
    function handleSave() {
        startTransition(async () => {
            try {
                await setAssignments({
                    clerkUserId: userId,
                    tenantIds: Array.from(selected!) as Id<"Tenants">[],
                });
                toast.success("テナント割当を保存しました");
            } catch {
                toast.error("保存に失敗しました");
            }
        });
    }

    const initials = (displayName || "?").slice(0, 2).toUpperCase();
    const tenantList = tenants ?? [];

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => history.back()}>
                    <ArrowLeft className="size-4" />
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">
                    テナント割当
                </h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <Avatar className="size-10">
                            <AvatarImage src={imageUrl ?? ""} alt={displayName} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{displayName}</p>
                            <p className="text-muted-foreground text-xs">
                                {selected!.size} / {tenantList.length} テナント割当済み
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tenantList.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            テナントがありません。先にテナントを作成してください。
                        </p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {tenantList.map((tenant) => {
                                const checked = selected!.has(tenant._id);
                                return (
                                    <label
                                        key={tenant._id}
                                        className={cn(
                                            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors select-none",
                                            "hover:bg-accent/50",
                                            checked
                                                ? "border-primary/30 bg-primary/5"
                                                : "bg-muted/40 border-transparent",
                                        )}
                                    >
                                        <Switch
                                            checked={checked}
                                            onCheckedChange={() => toggle(tenant._id)}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {tenant.tenantName}
                                            </span>
                                        </div>
                                        {checked && (
                                            <Check className="text-primary size-4 shrink-0" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    disabled={!isDirty || isPending}
                    onClick={handleSave}
                    className="min-w-28"
                >
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    <span>{isPending ? "保存中..." : "保存"}</span>
                </Button>
            </div>
        </div>
    );
}
