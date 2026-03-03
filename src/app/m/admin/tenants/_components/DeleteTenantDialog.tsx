"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import type { Id } from "@/../convex/_generated/dataModel";

type DeleteTenantDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenantId: Id<"Tenants">;
    tenantName: string;
};

export function DeleteTenantDialog({
    open,
    onOpenChange,
    tenantId,
    tenantName,
}: DeleteTenantDialogProps) {
    const removeTenant = useMutation(api.tenants.adminRemove);
    const [isPending, setIsPending] = React.useState(false);

    async function handleDelete() {
        setIsPending(true);
        try {
            await removeTenant({ tenantId });
            toast.success("テナントを削除しました");
            onOpenChange(false);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "テナント削除に失敗しました",
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>テナントを削除</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <AlertTriangle className="mt-0.5 size-6 shrink-0 text-red-500" />
                        <div>
                            <p className="text-base font-bold text-red-800">
                                {tenantName}
                            </p>
                            <p className="mt-1 text-sm text-red-700">
                                この操作は取り消せません。関連する全てのデータ（場所・サービス・予約枠・予約）も削除されます。
                            </p>
                        </div>
                    </div>
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
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="min-w-28"
                    >
                        {isPending && (
                            <Loader2 className="size-4 animate-spin" />
                        )}
                        <span>
                            {isPending ? "削除中..." : "削除する"}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
