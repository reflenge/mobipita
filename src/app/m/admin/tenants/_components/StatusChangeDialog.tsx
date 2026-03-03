"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Id } from "@/../convex/_generated/dataModel";

const statusLabels: Record<string, string> = {
    preparing: "準備中",
    open: "公開中",
    paused: "一時停止",
    closed: "終了",
};

type StatusChangeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenantId: Id<"Tenants">;
    tenantName: string;
    currentStatus: string;
};

export function StatusChangeDialog({
    open,
    onOpenChange,
    tenantId,
    tenantName,
    currentStatus,
}: StatusChangeDialogProps) {
    const updateStatus = useMutation(api.tenants.adminUpdateStatus);
    const [selectedStatus, setSelectedStatus] =
        React.useState(currentStatus);
    const [isPending, setIsPending] = React.useState(false);

    const isDirty = selectedStatus !== currentStatus;

    // ダイアログが開くたびに現在のステータスにリセット
    React.useEffect(() => {
        if (open) setSelectedStatus(currentStatus);
    }, [open, currentStatus]);

    async function handleSave() {
        if (!isDirty) return;
        setIsPending(true);
        try {
            await updateStatus({
                tenantId,
                tenantStatus: selectedStatus as
                    | "preparing"
                    | "open"
                    | "paused"
                    | "closed",
            });
            toast.success("ステータスを変更しました");
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "ステータス変更に失敗しました",
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ステータス変更</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-base">
                        <span className="font-bold">
                            {tenantName}
                        </span>
                        {" のステータスを変更します。"}
                    </p>
                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                    >
                        <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(statusLabels).map(
                                ([value, label]) => (
                                    <SelectItem
                                        key={value}
                                        value={value}
                                    >
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || isPending}
                        className="min-w-28"
                    >
                        {isPending && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        <span>
                            {isPending ? "変更中..." : "変更する"}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
