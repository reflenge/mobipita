"use client";

/**
 * 会社管理：ロール変更ダイアログ
 * ユーザーのロールを Select で選択し、サーバーアクションで Clerk の publicMetadata を更新する。
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Crown, ShieldCheck, Briefcase, UserX } from "lucide-react";
import { type AppRole, ROLE_LABELS } from "@/lib/roles";
import { updateUserRole } from "./actions";

/** ロールごとの Select 内アイコン */
const ROLE_ICON: Record<AppRole, React.ElementType> = {
    admin: Crown,
    company: ShieldCheck,
    staff: Briefcase,
    customer: UserX,
};

type RoleChangeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        displayName: string;
        identifier: string;
        imageUrl?: string | null;
        role: string;
        userId: string;
    };
    availableRoles: AppRole[];
    isSelf: boolean;
};

export function RoleChangeDialog({
    open,
    onOpenChange,
    user,
    availableRoles,
    isSelf,
}: RoleChangeDialogProps) {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = React.useState(user.role);
    const [isPending, startTransition] = React.useTransition();

    const isDirty = selectedRole !== user.role;

    /** ロール変更をサーバーに送信し、成功時はダイアログを閉じて一覧を再取得 */
    function handleSave() {
        if (!isDirty) return;
        startTransition(async () => {
            try {
                await updateUserRole(user.userId, selectedRole as AppRole);
                toast.success("ロールを変更しました");
                onOpenChange(false);
                router.refresh();
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : "ロール変更に失敗しました",
                );
            }
        });
    }

    const initials = (user.displayName || user.identifier || "?")
        .slice(0, 2)
        .toUpperCase();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ロール変更</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                            <AvatarImage
                                src={user.imageUrl ?? ""}
                                alt={user.displayName}
                            />
                            <AvatarFallback className="text-sm font-medium">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold">
                                {user.displayName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {user.identifier}
                            </p>
                        </div>
                    </div>

                    {isSelf ? (
                        <p className="text-muted-foreground text-sm">
                            自分自身のロールは変更できません。
                        </p>
                    ) : (
                        <Select
                            defaultValue={user.role}
                            onValueChange={setSelectedRole}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {availableRoles.map((role) => {
                                        const Icon = ROLE_ICON[role];
                                        return (
                                            <SelectItem key={role} value={role}>
                                                <span className="flex items-center gap-2">
                                                    <Icon className="size-3" />
                                                    {ROLE_LABELS[role]}
                                                </span>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || isPending || isSelf}
                        className="min-w-28"
                    >
                        {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        <span>{isPending ? "保存中..." : "保存"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
