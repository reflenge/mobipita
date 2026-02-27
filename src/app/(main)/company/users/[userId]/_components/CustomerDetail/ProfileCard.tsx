"use client";

import * as React from "react";
import {
    Shield,
    Store,
    Building2,
    Crown,
    ShieldCheck,
    Briefcase,
    UserX,
} from "lucide-react";
import type { UserInfo } from "./types";
import type { AppRole } from "@/lib/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GENDER_LABELS } from "@/lib/profile";
import { ROLE_LABELS } from "@/lib/roles";

const ROLE_ICON: Record<string, React.ElementType> = {
    admin: Crown,
    company: ShieldCheck,
    staff: Briefcase,
    customer: UserX,
};

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> =
    {
        admin: "default",
        company: "default",
        staff: "secondary",
        customer: "outline",
    };

function DetailRow({ label, value }: { label: string; value: string }) {
    const isUnset = value === "未設定" || value === "メモなし";
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={isUnset ? "text-muted-foreground/50" : ""}>
                {value}
            </span>
        </div>
    );
}

type ProfileCardProps = {
    user: UserInfo;
    assignedTenantNames: string[];
    onOpenRoleDialog: () => void;
    onOpenTenantDialog: () => void;
};

export function ProfileCard({
    user,
    assignedTenantNames,
    onOpenRoleDialog,
    onOpenTenantDialog,
}: ProfileCardProps) {
    const initials = user.displayName.slice(0, 2).toUpperCase() || "?";
    const RIcon = ROLE_ICON[user.role ?? "customer"] ?? UserX;
    const badgeVariant =
        ROLE_BADGE_VARIANT[user.role ?? "customer"] ?? "outline";

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                    <Avatar className="size-12">
                        <AvatarImage
                            src={user.imageUrl}
                            alt={user.displayName}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold">
                                {user.displayName}
                            </p>
                            <Badge
                                variant={badgeVariant}
                                className="gap-1 text-[10px] leading-none"
                            >
                                <RIcon className="size-3" />
                                {ROLE_LABELS[user.role as AppRole] ??
                                    user.role ??
                                    "カスタマー"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {user.email}
                        </p>
                        {assignedTenantNames.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {assignedTenantNames.map((name) => (
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
                        {assignedTenantNames.length === 0 &&
                            user.role !== "customer" && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                    未割当
                                </p>
                            )}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenRoleDialog}
                    >
                        <Shield className="size-3.5" />
                        ロール変更
                    </Button>
                    {user.role !== "customer" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenTenantDialog}
                        >
                            <Store className="size-3.5" />
                            テナント割当
                        </Button>
                    )}
                </div>
            </CardContent>
            <CardContent className="space-y-2 text-sm">
                <DetailRow
                    label="性別"
                    value={
                        user.gender
                            ? (GENDER_LABELS[user.gender] ?? user.gender)
                            : "未設定"
                    }
                />
                <DetailRow label="生年月日" value={user.birthday ?? "未設定"} />
                <DetailRow label="電話番号" value={user.phone ?? "未設定"} />
                {user.address ? (
                    <DetailRow
                        label="住所"
                        value={`〒${user.address.postalCode} ${user.address.prefecture}${user.address.city}${user.address.line}`}
                    />
                ) : (
                    <DetailRow label="住所" value="未設定" />
                )}
            </CardContent>
        </Card>
    );
}
