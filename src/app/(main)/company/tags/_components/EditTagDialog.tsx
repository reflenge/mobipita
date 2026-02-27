"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { EditTagForm } from "./types";

type EditTagDialogProps = {
    tag: EditTagForm | null;
    onOpenChange: (open: boolean) => void;
    onSave: (values: EditTagForm) => void | Promise<void>;
    isPending: boolean;
};

export function EditTagDialog({
    tag,
    onOpenChange,
    onSave,
    isPending,
}: EditTagDialogProps) {
    const [form, setForm] = React.useState<EditTagForm | null>(null);

    React.useEffect(() => {
        setForm(tag ? { ...tag } : null);
    }, [tag]);

    const displayForm = form ?? tag;

    const handleSave = () => {
        if (!displayForm || !displayForm.title.trim()) return;
        void onSave(displayForm);
        onOpenChange(false);
    };

    return (
        <Dialog
            open={tag !== null}
            onOpenChange={(open) => !open && onOpenChange(false)}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>タグを編集</DialogTitle>
                </DialogHeader>
                {displayForm && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">タイトル</Label>
                            <Input
                                id="edit-title"
                                value={displayForm.title}
onChange={(e) =>
                                    setForm((prev) =>
                                        prev
                                            ? { ...prev, title: e.target.value }
                                            : tag
                                                ? { ...tag, title: e.target.value }
                                                : null
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-desc">説明</Label>
                            <Textarea
                                id="edit-desc"
                                value={displayForm.description}
                                onChange={(e) =>
                                    setForm((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  description: e.target.value,
                                              }
                                            : tag
                                                ? {
                                                      ...tag,
                                                      description: e.target.value,
                                                  }
                                                : null
                                    )
                                }
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-color">色</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    id="edit-color"
                                    type="color"
                                    value={displayForm.color}
                                    onChange={(e) =>
                                    setForm((prev) =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  color: e.target.value,
                                              }
                                            : tag
                                                ? {
                                                      ...tag,
                                                      color: e.target.value,
                                                  }
                                                : null
                                    )
                                    }
                                    className="size-10 cursor-pointer rounded border p-1"
                                />
                                <span className="text-muted-foreground text-sm">
                                    {displayForm.color}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={
                            !displayForm?.title.trim() || isPending
                        }
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
