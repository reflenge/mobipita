"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_COLOR = "#6366f1";

export type CreateTagValues = {
    title: string;
    description: string;
    color: string;
};

type CreateTagDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: CreateTagValues) => void | Promise<void>;
    isPending: boolean;
};

export function CreateTagDialog({
    open,
    onOpenChange,
    onSubmit,
    isPending,
}: CreateTagDialogProps) {
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [color, setColor] = React.useState(DEFAULT_COLOR);

    React.useEffect(() => {
        if (!open) {
            setTitle("");
            setDescription("");
            setColor(DEFAULT_COLOR);
        }
    }, [open]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        void onSubmit({ title, description, color });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>タグを作成</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tag-title">タイトル</Label>
                        <Input
                            id="tag-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="VIP"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-desc">説明</Label>
                        <Textarea
                            id="tag-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="特別な対応が必要な顧客"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag-color">色</Label>
                        <div className="flex items-center gap-3">
                            <input
                                id="tag-color"
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="size-10 cursor-pointer rounded border p-1"
                            />
                            <span className="text-muted-foreground text-sm">
                                {color}
                            </span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim() || isPending}
                        className="min-w-28"
                    >
                        {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : null}
                        <span>{isPending ? "作成中..." : "作成"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
