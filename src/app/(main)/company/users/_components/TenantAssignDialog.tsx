"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type TenantAssignDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        userId: string;
        displayName: string;
        imageUrl?: string | null;
    };
};

export function TenantAssignDialog({
    open,
    onOpenChange,
    user,
}: TenantAssignDialogProps) {
    const tenants = useQuery(api.tenants.list, { limit: 100 });
    const memberTenants = useQuery(
        api.tenantMemberAssignments.listByMember,
        open ? { clerkUserId: user.userId } : "skip",
    );
    const setAssignments = useMutation(
        api.tenantMemberAssignments.setAssignmentsForMember,
    );

    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [initialized, setInitialized] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        if (open && memberTenants && !initialized) {
            setSelected(new Set(memberTenants));
            setInitialized(true);
        }
        if (!open) {
            setInitialized(false);
        }
    }, [open, memberTenants, initialized]);

    const isLoading = tenants === undefined || memberTenants === undefined || !initialized;

    const currentSet = new Set(memberTenants ?? []);
    const isDirty =
        initialized &&
        (selected.size !== currentSet.size ||
            [...selected].some((id) => !currentSet.has(id as Id<"Tenants">)));

    function toggle(tenantId: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(tenantId)) next.delete(tenantId);
            else next.add(tenantId);
            return next;
        });
    }

    function handleSave() {
        startTransition(async () => {
            try {
                await setAssignments({
                    clerkUserId: user.userId,
                    tenantIds: Array.from(selected) as Id<"Tenants">[],
                });
                toast.success("テナント割当を保存しました");
                onOpenChange(false);
            } catch {
                toast.error("保存に失敗しました");
            }
        });
    }

    const initials = (user.displayName || "?").slice(0, 2).toUpperCase();
    const tenantList = tenants ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>テナント割当</DialogTitle>
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
                            {initialized && (
                                <p className="text-muted-foreground text-xs">
                                    {selected.size} / {tenantList.length} 割当済み
                                </p>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : tenantList.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            テナントがありません。先にテナントを作成してください。
                        </p>
                    ) : (
                        <div className="grid gap-2">
                            {tenantList.map((tenant) => {
                                const checked = selected.has(tenant._id);
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
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                                            {tenant.tenantName}
                                        </span>
                                        {checked && (
                                            <Check className="text-primary size-4 shrink-0" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || isPending}
                        className="min-w-28"
                    >
                        {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        <span>{isPending ? "保存中..." : "保存"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
