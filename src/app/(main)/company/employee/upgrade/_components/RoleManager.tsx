"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type AppRole, ROLE_LABELS, hasMinRole } from "@/lib/roles";
import { updateUserRole } from "../actions";
import type { UserForUpgrade } from "../page";
import {
    Search,
    Crown,
    ShieldCheck,
    Briefcase,
    UserX,
    Loader2,
} from "lucide-react";

const ROLE_ICON: Record<AppRole, React.ElementType> = {
    admin: Crown,
    company: ShieldCheck,
    staff: Briefcase,
    customer: UserX,
};

const ROLE_BADGE_VARIANT: Record<AppRole, "default" | "secondary" | "outline"> =
    {
        admin: "default",
        company: "default",
        staff: "secondary",
        customer: "outline",
    };

type RoleManagerProps = {
    users: UserForUpgrade[];
    operatorRole: AppRole;
    availableRoles: AppRole[];
};

export function RoleManager({
    users,
    operatorRole,
    availableRoles,
}: RoleManagerProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [pendingUserId, setPendingUserId] = React.useState<string | null>(
        null,
    );

    const filtered = React.useMemo(() => {
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(
            (u) =>
                u.displayName.toLowerCase().includes(q) ||
                u.identifier.toLowerCase().includes(q),
        );
    }, [users, searchQuery]);

    async function handleRoleChange(targetUserId: string, newRole: AppRole) {
        setPendingUserId(targetUserId);
        try {
            await updateUserRole(targetUserId, newRole);
            toast.success("ロールを変更しました（再ログインで反映されます）");
            router.refresh();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "ロール変更に失敗しました",
            );
        } finally {
            setPendingUserId(null);
        }
    }

    return (
        <section className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    ロール管理
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    ユーザーのロールを変更できます。
                    {operatorRole === "admin"
                        ? "管理者権限で全ロールを割り当てられます。"
                        : "会社以下のロールを割り当てられます。"}
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => {
                    const Icon = ROLE_ICON[role];
                    return (
                        <Badge
                            key={role}
                            variant={ROLE_BADGE_VARIANT[role]}
                            className="gap-1"
                        >
                            <Icon className="size-3" />
                            {ROLE_LABELS[role]}
                        </Badge>
                    );
                })}
                <span className="text-muted-foreground self-center text-xs">
                    ← 割り当て可能なロール
                </span>
            </div>

            {users.length > 4 && (
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

            <div className="space-y-2">
                {filtered.map((user) => {
                    const Icon = ROLE_ICON[user.currentRole] ?? UserX;
                    const isPending = pendingUserId === user.userId;
                    const canChangeThisUser = hasMinRole(
                        operatorRole,
                        user.currentRole,
                    );

                    const initials = (
                        user.displayName ||
                        user.identifier ||
                        "?"
                    )
                        .slice(0, 2)
                        .toUpperCase();

                    return (
                        <Card
                            key={user.userId}
                            className="hover:bg-accent/30 transition-colors"
                        >
                            <CardContent className="flex items-center gap-4 py-4">
                                <Avatar className="size-11 shrink-0">
                                    <AvatarImage
                                        src={user.imageUrl ?? ""}
                                        alt={user.displayName}
                                    />
                                    <AvatarFallback className="text-sm font-medium">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="truncate text-sm font-semibold">
                                            {user.displayName}
                                        </span>
                                        <Badge
                                            variant={
                                                ROLE_BADGE_VARIANT[
                                                    user.currentRole
                                                ] ?? "outline"
                                            }
                                            className="gap-1 text-[10px] leading-none"
                                        >
                                            <Icon className="size-3" />
                                            {ROLE_LABELS[user.currentRole] ??
                                                user.currentRole}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {user.identifier}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isPending && (
                                        <Loader2 className="text-muted-foreground size-4 animate-spin" />
                                    )}
                                    <Select
                                        value={user.currentRole}
                                        onValueChange={(v) =>
                                            handleRoleChange(
                                                user.userId,
                                                v as AppRole,
                                            )
                                        }
                                        disabled={
                                            isPending || !canChangeThisUser
                                        }
                                    >
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRoles.map((role) => {
                                                const RIcon = ROLE_ICON[role];
                                                return (
                                                    <SelectItem
                                                        key={role}
                                                        value={role}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <RIcon className="size-3" />
                                                            {ROLE_LABELS[role]}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {filtered.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                            <Search className="text-muted-foreground/50 size-8" />
                            <p className="text-muted-foreground text-sm">
                                条件に一致するユーザーが見つかりません
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    );
}
