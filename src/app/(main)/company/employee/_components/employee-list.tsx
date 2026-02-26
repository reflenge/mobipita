"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/link";
import { cn } from "@/lib/utils";
import {
    Users,
    ShieldCheck,
    Briefcase,
    UserX,
    Search,
    Building2,
    ArrowRight,
    UserPlus,
    Store,
} from "lucide-react";

/** Clerk からシリアライズした組織メンバー情報 */
export type EmployeeSummary = {
    userId: string;
    role: string;
    displayName: string;
    /** メール等の識別子 */
    identifier: string;
    imageUrl?: string | null;
    /** メンバーシップ作成日時 (UNIX ms) */
    createdAt: number;
};

type EmployeeListProps = {
    employees: EmployeeSummary[];
};

const ROLE_CONFIG: Record<
    string,
    {
        label: string;
        variant: "default" | "secondary" | "outline";
        icon: React.ElementType;
    }
> = {
    admin: { label: "管理者", variant: "default", icon: ShieldCheck },
    company: { label: "会社", variant: "default", icon: ShieldCheck },
    staff: { label: "スタッフ", variant: "secondary", icon: Briefcase },
    customer: { label: "カスタマー", variant: "outline", icon: UserX },
};

type RoleFilter = "all" | "admin" | "company" | "staff" | "customer";

/**
 * 従業員一覧コンポーネント
 * - Clerk のメンバー一覧を表示
 * - Convex のテナント割当データと結合して割当先テナントを表示
 * - ロール別フィルタ・名前検索に対応
 */
export function EmployeeList({ employees }: EmployeeListProps) {
    // ---------- データ取得 ----------
    const tenants = useQuery(api.tenants.list, {
        limit: 100,
    });
    const assignments = useQuery(api.tenantMemberAssignments.listAll, {});

    // ---------- ローカル state ----------
    const [searchQuery, setSearchQuery] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all");

    // ---------- 派生データ ----------

    /** テナントIDからテナント名への逆引きマップ */
    const tenantMap = React.useMemo(() => {
        const map = new Map<string, string>();
        if (!tenants) return map;
        for (const t of tenants) {
            map.set(t._id, t.tenantName);
        }
        return map;
    }, [tenants]);

    /** clerkUserId → 割当先テナントID の Set */
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

    /** ロール別の人数集計 */
    const roleCounts = React.useMemo(() => {
        const counts: Record<string, number> = {};
        for (const e of employees) {
            counts[e.role] = (counts[e.role] ?? 0) + 1;
        }
        return counts;
    }, [employees]);

    /** フィルタ・検索を適用したメンバー一覧 */
    const filteredEmployees = React.useMemo(() => {
        let list = employees;
        if (roleFilter === "company") {
            list = list.filter(
                (e) => e.role === "admin" || e.role === "company",
            );
        } else if (roleFilter !== "all") {
            list = list.filter((e) => e.role === roleFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (e) =>
                    e.displayName.toLowerCase().includes(q) ||
                    e.identifier.toLowerCase().includes(q),
            );
        }
        return list;
    }, [employees, roleFilter, searchQuery]);

    const isLoading = tenants === undefined || assignments === undefined;

    // ---------- レンダリング ----------

    return (
        <section className="space-y-6">
            {/* ヘッダー */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        従業員一覧
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        組織に所属するすべてのメンバーと、各メンバーの割当テナントを確認できます。
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/company/employee/upgrade">
                            <UserPlus className="size-4" />
                            従業員へ昇格
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/company/employee/assignment">
                            <Store className="size-4" />
                            テナント割当
                        </Link>
                    </Button>
                </div>
            </div>

            {/* サマリーカード */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <SummaryCard
                    icon={Users}
                    iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                    value={employees.length}
                    label="全メンバー"
                    active={roleFilter === "all"}
                    onClick={() => setRoleFilter("all")}
                />
                <SummaryCard
                    icon={ShieldCheck}
                    iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                    value={
                        (roleCounts["admin"] ?? 0) +
                        (roleCounts["company"] ?? 0)
                    }
                    label="管理者"
                    active={roleFilter === "company"}
                    onClick={() =>
                        setRoleFilter((p) =>
                            p === "company" ? "all" : "company",
                        )
                    }
                />
                <SummaryCard
                    icon={Briefcase}
                    iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    value={roleCounts["staff"] ?? 0}
                    label="スタッフ"
                    active={roleFilter === "staff"}
                    onClick={() =>
                        setRoleFilter((p) => (p === "staff" ? "all" : "staff"))
                    }
                />
                <SummaryCard
                    icon={UserX}
                    iconClassName="bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                    value={roleCounts["customer"] ?? 0}
                    label="カスタマー"
                    active={roleFilter === "customer"}
                    onClick={() =>
                        setRoleFilter((p) =>
                            p === "customer" ? "all" : "customer",
                        )
                    }
                />
            </div>

            {/* 検索バー */}
            {employees.length > 4 && (
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

            {/* メンバー一覧 */}
            {employees.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
                            <Users className="text-muted-foreground size-7" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                メンバーがいません
                            </CardTitle>
                            <CardDescription className="max-w-sm">
                                組織にメンバーを招待してください。
                            </CardDescription>
                        </div>
                    </CardContent>
                </Card>
            ) : filteredEmployees.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                        <Search className="text-muted-foreground/50 size-8" />
                        <p className="text-muted-foreground text-sm">
                            条件に一致するメンバーが見つかりません
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredEmployees.map((emp) => {
                        const config = ROLE_CONFIG[emp.role] ?? {
                            label: emp.role,
                            variant: "outline" as const,
                            icon: UserX,
                        };
                        const RoleIcon = config.icon;
                        const initials = (
                            emp.displayName ||
                            emp.identifier ||
                            "?"
                        )
                            .slice(0, 2)
                            .toUpperCase();

                        const userTenantIds = assignmentsByUser.get(emp.userId);
                        const assignedTenants = userTenantIds
                            ? Array.from(userTenantIds)
                                  .map((id) => tenantMap.get(id))
                                  .filter(Boolean)
                            : [];

                        return (
                            <Card
                                key={emp.userId}
                                className="hover:bg-accent/30 transition-colors"
                            >
                                <CardContent className="flex items-center gap-4 py-4">
                                    {/* アバター */}
                                    <Avatar className="size-11 shrink-0">
                                        <AvatarImage
                                            src={emp.imageUrl ?? ""}
                                            alt={emp.displayName}
                                        />
                                        <AvatarFallback className="text-sm font-medium">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* 名前・メール */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="truncate text-sm font-semibold">
                                                {emp.displayName || "名前なし"}
                                            </span>
                                            <Badge
                                                variant={config.variant}
                                                className="gap-1 text-[10px] leading-none"
                                            >
                                                <RoleIcon className="size-3" />
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {emp.identifier}
                                        </p>
                                    </div>

                                    {/* 割当テナント */}
                                    <div className="hidden items-center gap-2 sm:flex">
                                        {isLoading ? (
                                            <Skeleton className="h-5 w-24 rounded-full" />
                                        ) : assignedTenants.length > 0 ? (
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {assignedTenants.map((name) => (
                                                    <Badge
                                                        key={name}
                                                        variant="outline"
                                                        className="gap-1 text-[10px]"
                                                    >
                                                        <Building2 className="size-3" />
                                                        {name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : emp.role !== "customer" ? (
                                            <span className="text-muted-foreground text-xs">
                                                未割当
                                            </span>
                                        ) : null}
                                    </div>

                                    {/* 詳細アイコン (テナント割当画面へ) */}
                                    {emp.role !== "customer" && (
                                        <Link
                                            href="/company/employee/assignment"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    )}
                                </CardContent>

                                {/* モバイル用テナント表示 */}
                                {!isLoading && assignedTenants.length > 0 && (
                                    <div className="flex flex-wrap gap-1 border-t px-6 py-2.5 sm:hidden">
                                        {assignedTenants.map((name) => (
                                            <Badge
                                                key={name}
                                                variant="outline"
                                                className="gap-1 text-[10px]"
                                            >
                                                <Building2 className="size-3" />
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

/** サマリーカード（クリックでフィルタ切り替え） */
function SummaryCard({
    icon: Icon,
    iconClassName,
    value,
    label,
    active,
    onClick,
}: {
    icon: React.ElementType;
    iconClassName: string;
    value: number;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <Card
            className={cn(
                "hover:bg-accent/40 cursor-pointer transition-colors select-none",
                active && "ring-primary/40 ring-2",
            )}
            onClick={onClick}
        >
            <CardContent className="flex items-center gap-3 py-4">
                <div
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        iconClassName,
                    )}
                >
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-2xl leading-none font-bold tabular-nums">
                        {value}
                    </p>
                    <p className="text-muted-foreground text-xs">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
