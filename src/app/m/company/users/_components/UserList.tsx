"use client";

/**
 * 会社管理：ユーザー一覧コンポーネント
 * Clerk ユーザー一覧と Convex のテナント割当を組み合わせてカード表示。
 * ロール変更ダイアログ・テナント割当・詳細へのリンクを提供する。
 */
import * as React from "react";
import { useQuery } from "convex/react";
import {
    Users,
    ShieldCheck,
    Briefcase,
    UserX,
    Building2,
    Shield,
    Store,
    UserCircle,
    Crown,
} from "lucide-react";
import { RoleChangeDialog } from "./RoleChangeDialog";
import { TenantAssignDialog } from "./TenantAssignDialog";
import type { AppRole } from "@/lib/roles";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/** 一覧表示用のユーザー要約（Clerk + ロール） */
export type UserSummary = {
    userId: string;
    role: string;
    displayName: string;
    identifier: string;
    imageUrl: string;
    createdAt: number;
};

type UserListProps = {
    users: UserSummary[];
    availableRoles: AppRole[];
    currentUserId: string;
    basePath: string;
};

/** ロールごとの表示ラベル・バッジ種類・アイコン */
const ROLE_CONFIG: Record<
    string,
    {
        label: string;
        variant: "default" | "secondary" | "outline";
        icon: React.ElementType;
    }
> = {
    admin: { label: "管理者", variant: "default", icon: Crown },
    company: { label: "会社", variant: "default", icon: ShieldCheck },
    staff: { label: "スタッフ", variant: "secondary", icon: Briefcase },
    customer: { label: "カスタマー", variant: "outline", icon: UserX },
};

export function UserList({
    users,
    availableRoles,
    currentUserId,
    basePath,
}: UserListProps) {
    const tenants = useQuery(api.tenants.list, { limit: 100 });
    const assignments = useQuery(api.tenantMemberAssignments.listAll, {});

    const [roleDialogUser, setRoleDialogUser] =
        React.useState<UserSummary | null>(null);
    const [tenantDialogUser, setTenantDialogUser] =
        React.useState<UserSummary | null>(null);

    /** テナント ID → テナント名のマップ（バッジ表示用） */
    const tenantMap = React.useMemo(() => {
        const map = new Map<string, string>();
        if (!tenants) return map;
        for (const t of tenants) map.set(t._id, t.tenantName);
        return map;
    }, [tenants]);

    /** ユーザー ID → 割当テナント ID の Set（ユーザーごとの割当一覧） */
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

    const isLoading = tenants === undefined || assignments === undefined;

    return (
        <section className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    ユーザー一覧
                </h1>
                <p className="text-muted-foreground text-sm">
                    ユーザーの管理・ロール変更・テナント割当・詳細確認ができます。
                </p>
            </div>

            {users.length === 0 ? (
                /* ユーザーが 0 件のときの空状態 */
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
                            <Users className="text-muted-foreground size-7" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                ユーザーがいません
                            </CardTitle>
                            <CardDescription className="max-w-sm">
                                ユーザーを招待してください。
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {users.map((user) => {
                        const config = ROLE_CONFIG[user.role] ?? {
                            /* 未定義ロール用のフォールバック */
                            label: user.role,
                            variant: "outline" as const,
                            icon: UserX,
                        };
                        const RoleIcon = config.icon;

                        const userTenantIds = assignmentsByUser.get(
                            user.userId,
                        );
                        const assignedTenants = userTenantIds
                            ? Array.from(userTenantIds)
                                  .map((id) => tenantMap.get(id))
                                  .filter(Boolean)
                            : [];

                        return (
                            <Card
                                key={user.userId}
                                className="hover:bg-accent/30 transition-colors"
                            >
                                <CardHeader className="flex flex-row items-center gap-3">
                                    <Avatar className="size-11 shrink-0">
                                        <AvatarImage
                                            src={user.imageUrl ?? ""}
                                            alt={user.displayName}
                                        />
                                        <AvatarFallback>
                                            {user.displayName
                                                .slice(0, 2)
                                                .toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle>
                                            {user.displayName || "名前なし"}
                                        </CardTitle>
                                        <CardDescription>
                                            {user.identifier}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-muted-foreground text-xs font-medium">
                                            ロール
                                        </span>
                                        <Badge
                                            variant={config.variant}
                                            className="gap-1 text-[10px] leading-none"
                                        >
                                            <RoleIcon className="size-3 shrink-0" />
                                            {config.label}
                                        </Badge>
                                    </div>
                                    {user.role !== "customer" && (
                                        <div className="flex flex-wrap items-start gap-2">
                                            <span className="text-muted-foreground text-xs font-medium">
                                                テナント
                                            </span>
                                            {!isLoading &&
                                            assignedTenants.length > 0 ? (
                                                <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                                                    {assignedTenants.map(
                                                        (name) => (
                                                            <Badge
                                                                key={name}
                                                                variant="outline"
                                                                className="gap-1 text-[10px]"
                                                            >
                                                                <Building2 className="size-3 shrink-0" />
                                                                {name}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            ) : !isLoading ? (
                                                <span className="text-muted-foreground text-xs">
                                                    未割当
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">
                                                    …
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={`${basePath}/${user.userId}`}
                                        >
                                            <UserCircle className="size-3.5 shrink-0" />
                                            <span>詳細</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRoleDialogUser(user)}
                                    >
                                        <Shield className="size-3.5 shrink-0" />
                                        <span>ロール</span>
                                    </Button>
                                    {user.role !== "customer" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setTenantDialogUser(user)
                                            }
                                        >
                                            <Store className="size-3.5 shrink-0" />
                                            <span>テナント</span>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ロール変更ダイアログ */}
            {roleDialogUser && (
                <RoleChangeDialog
                    open={!!roleDialogUser}
                    onOpenChange={(open) => {
                        if (!open) setRoleDialogUser(null);
                    }}
                    user={roleDialogUser}
                    availableRoles={availableRoles}
                    isSelf={roleDialogUser.userId === currentUserId}
                />
            )}

            {/* テナント割当ダイアログ */}
            {tenantDialogUser && (
                <TenantAssignDialog
                    open={!!tenantDialogUser}
                    onOpenChange={(open) => {
                        if (!open) setTenantDialogUser(null);
                    }}
                    user={tenantDialogUser}
                />
            )}
        </section>
    );
}
