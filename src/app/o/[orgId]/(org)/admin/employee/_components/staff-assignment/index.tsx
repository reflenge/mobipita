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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Users,
    Building2,
    Search,
    Save,
    Check,
    AlertCircle,
    UserPlus,
    Store,
} from "lucide-react";

/** サーバーから渡すメンバー情報（Clerk の組織メンバーをシリアライズしたもの） */
export type MemberSummary = {
    userId: string;
    role: string;
    displayName: string;
    /** メール等の識別子 */
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

/**
 * テナントへの従業員割当 UI
 * - Convex からテナント一覧と既存の割当を取得
 * - ローカル state で変更を管理し、保存ボタンで Convex に反映
 */
export function StaffAssignment({ orgId, members }: StaffAssignmentProps) {
    // ---------- データ取得 ----------
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

    // ---------- ローカル state ----------
    const [searchQuery, setSearchQuery] = React.useState("");
    const [savingUserId, setSavingUserId] = React.useState<string | null>(null);
    const [savingAll, setSavingAll] = React.useState(false);

    /** DB から取得した割当を clerkUserId → Set<tenantId> に変換 */
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

    /** ユーザーが画面上で変更した未保存の割当（userId → Set<tenantId>） */
    const [selected, setSelected] = React.useState<Record<string, Set<string>>>(
        () => ({}),
    );

    /** ローカル変更があればそちらを、なければ DB の値を返す */
    const isSelected = (userId: string, tenantId: string) => {
        const local = selected[userId];
        if (local) return local.has(tenantId);
        return assignmentsByUser.get(userId)?.has(tenantId) ?? false;
    };

    /** ローカル state が DB と異なるかどうか */
    const isDirty = (userId: string) => {
        const local = selected[userId];
        if (!local) return false;
        const remote = assignmentsByUser.get(userId) ?? new Set<string>();
        if (local.size !== remote.size) return true;
        for (const id of local) {
            if (!remote.has(id)) return true;
        }
        return false;
    };

    /** 未保存の変更があるユーザー ID 一覧 */
    const dirtyUserIds = React.useMemo(
        () => members.filter((m) => isDirty(m.userId)).map((m) => m.userId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [members, selected, assignmentsByUser],
    );

    // ---------- アクション ----------

    /** テナント割当の ON/OFF を切り替え */
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

    /** 特定メンバーの割当を DB に保存 */
    const saveForMember = async (userId: string) => {
        const raw = selected[userId] ?? assignmentsByUser.get(userId);
        const tenantIds = raw ? (Array.from(raw) as Id<"Tenants">[]) : [];
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
            toast.success("割当を保存しました");
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            toast.error("保存に失敗しました", { description: message });
        } finally {
            setSavingUserId(null);
        }
    };

    /** 未保存の全メンバーをまとめて保存 */
    const saveAll = async () => {
        if (dirtyUserIds.length === 0) return;
        setSavingAll(true);
        let successCount = 0;
        let errorCount = 0;
        for (const userId of dirtyUserIds) {
            const raw = selected[userId] ?? assignmentsByUser.get(userId);
            const tenantIds = raw ? (Array.from(raw) as Id<"Tenants">[]) : [];
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
                successCount++;
            } catch {
                errorCount++;
            }
        }
        setSavingAll(false);
        if (errorCount > 0) {
            toast.error(`${errorCount}件の保存に失敗しました`, {
                description: `${successCount}件は正常に保存されました`,
            });
        } else {
            toast.success(`${successCount}件の割当を保存しました`);
        }
    };

    // ---------- 派生データ ----------

    /** 検索クエリでフィルタリングされたメンバー一覧 */
    const filteredMembers = React.useMemo(() => {
        if (!searchQuery.trim()) return members;
        const q = searchQuery.toLowerCase();
        return members.filter(
            (m) =>
                m.displayName.toLowerCase().includes(q) ||
                m.identifier.toLowerCase().includes(q),
        );
    }, [members, searchQuery]);

    /** メンバーが割当されているテナント数 */
    const assignedCount = (userId: string) => {
        const local = selected[userId];
        if (local) return local.size;
        return assignmentsByUser.get(userId)?.size ?? 0;
    };

    // ---------- レンダリング ----------

    const isLoading = tenants === undefined || assignments === undefined;

    // ローディング中はスケルトンを表示
    if (isLoading) {
        return (
            <section className="space-y-6">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </section>
        );
    }

    const tenantList = tenants ?? [];

    // 空状態: メンバーなし
    if (members.length === 0) {
        return (
            <section className="space-y-6">
                <Header />
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
                            <UserPlus className="text-muted-foreground size-7" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                従業員が見つかりません
                            </CardTitle>
                            <CardDescription className="max-w-sm">
                                組織に Admin / Member がまだいないようです。
                                「従業員へ昇格する」で Member
                                に昇格させてから振り分けてください。
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    }

    // 空状態: テナントなし
    if (tenantList.length === 0) {
        return (
            <section className="space-y-6">
                <Header />
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
                            <Store className="text-muted-foreground size-7" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                テナントがありません
                            </CardTitle>
                            <CardDescription className="max-w-sm">
                                先にテナントを作成してから、従業員を割り当ててください。
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <Header />

            {/* サマリーカード */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                            <Users className="size-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl leading-none font-bold">
                                {members.length}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                従業員
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 py-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950">
                            <Building2 className="size-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl leading-none font-bold">
                                {tenantList.length}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                テナント
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={cn(
                        "col-span-2 sm:col-span-1",
                        dirtyUserIds.length > 0 &&
                            "border-amber-300 dark:border-amber-700",
                    )}
                >
                    <CardContent className="flex items-center gap-3 py-4">
                        <div
                            className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                                dirtyUserIds.length > 0
                                    ? "bg-amber-100 dark:bg-amber-950"
                                    : "bg-green-100 dark:bg-green-950",
                            )}
                        >
                            {dirtyUserIds.length > 0 ? (
                                <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <Check className="size-5 text-green-600 dark:text-green-400" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-2xl leading-none font-bold">
                                {dirtyUserIds.length}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                未保存
                            </p>
                        </div>
                        {dirtyUserIds.length > 0 && (
                            <Button
                                size="sm"
                                onClick={saveAll}
                                disabled={savingAll}
                                className="shrink-0"
                            >
                                {savingAll ? (
                                    <Spinner />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                <span className="hidden sm:inline">
                                    すべて保存
                                </span>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 検索バー（5人以上で表示） */}
            {members.length > 4 && (
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                        placeholder="名前またはメールで検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {/* メンバー一覧 — 各メンバーごとにテナント割当を Switch で操作 */}
            <div className="space-y-3">
                {/* 検索結果なし */}
                {filteredMembers.length === 0 && searchQuery.trim() && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                            <Search className="text-muted-foreground/50 size-8" />
                            <p className="text-muted-foreground text-sm">
                                「{searchQuery}
                                」に一致する従業員が見つかりません
                            </p>
                        </CardContent>
                    </Card>
                )}

                {filteredMembers.map((member) => {
                    const roleLabel = roleLabelMap[member.role] ?? member.role;
                    const initials = (
                        member.displayName ||
                        member.identifier ||
                        "?"
                    )
                        .slice(0, 2)
                        .toUpperCase();
                    const isSaving = savingUserId === member.userId;
                    const memberDirty = isDirty(member.userId);
                    const count = assignedCount(member.userId);

                    return (
                        <Card
                            key={member.userId}
                            className={cn(
                                "transition-colors",
                                memberDirty &&
                                    "border-amber-300 dark:border-amber-700",
                            )}
                        >
                            <CardHeader className="gap-0 pb-0">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-10">
                                            <AvatarImage
                                                src={member.imageUrl ?? ""}
                                                alt={member.displayName}
                                            />
                                            <AvatarFallback className="text-sm font-medium">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CardTitle className="text-base leading-snug">
                                                    {member.displayName ||
                                                        "名前なし"}
                                                </CardTitle>
                                                <Badge
                                                    variant={
                                                        member.role ===
                                                        "org:admin"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="text-[10px] leading-none"
                                                >
                                                    {roleLabel}
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {member.identifier}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="tabular-nums"
                                        >
                                            {count} / {tenantList.length}
                                        </Badge>
                                        {memberDirty && (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                disabled={isSaving}
                                                onClick={() =>
                                                    saveForMember(member.userId)
                                                }
                                            >
                                                {isSaving ? (
                                                    <Spinner />
                                                ) : (
                                                    <Save className="size-3.5" />
                                                )}
                                                保存
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <Separator />

                            <CardContent className="pt-4">
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {tenantList.map((tenant) => {
                                        const checked = isSelected(
                                            member.userId,
                                            tenant._id,
                                        );
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
                                                    onCheckedChange={() =>
                                                        toggle(
                                                            member.userId,
                                                            tenant._id,
                                                        )
                                                    }
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium">
                                                        {tenant.tenantName}
                                                    </span>
                                                    <span className="text-muted-foreground block truncate text-xs">
                                                        /{tenant.tenantSlug}
                                                    </span>
                                                </div>
                                                {checked && (
                                                    <Check className="text-primary size-4 shrink-0" />
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}

/** ページ上部のタイトル・説明 */
function Header() {
    return (
        <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
                テナントへの従業員割当
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
                組織の Admin / Member
                をテナントに割り当てます。1人を複数テナントに割り当て可能です。
            </p>
        </div>
    );
}
