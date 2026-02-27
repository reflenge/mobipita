"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Tag } from "lucide-react";

export default function TagsPage() {
    const tags = useQuery(api.staffTags.listAll);
    const createTag = useMutation(api.staffTags.create);
    const updateTag = useMutation(api.staffTags.update);
    const deactivateTag = useMutation(api.staffTags.deactivate);
    const activateTag = useMutation(api.staffTags.activate);

    const [showCreate, setShowCreate] = React.useState(false);
    const [createTitle, setCreateTitle] = React.useState("");
    const [createDesc, setCreateDesc] = React.useState("");
    const [creating, setCreating] = React.useState(false);

    const [editingTag, setEditingTag] = React.useState<{
        id: Id<"StaffTags">;
        title: string;
        description: string;
    } | null>(null);
    const [editSaving, setEditSaving] = React.useState(false);

    async function handleCreate() {
        if (!createTitle.trim()) return;
        setCreating(true);
        try {
            await createTag({
                title: createTitle.trim(),
                description: createDesc.trim(),
            });
            toast.success("タグを作成しました");
            setCreateTitle("");
            setCreateDesc("");
            setShowCreate(false);
        } catch {
            toast.error("タグの作成に失敗しました");
        } finally {
            setCreating(false);
        }
    }

    async function handleUpdate() {
        if (!editingTag || !editingTag.title.trim()) return;
        setEditSaving(true);
        try {
            await updateTag({
                tagId: editingTag.id,
                title: editingTag.title.trim(),
                description: editingTag.description.trim(),
            });
            toast.success("タグを更新しました");
            setEditingTag(null);
        } catch {
            toast.error("タグの更新に失敗しました");
        } finally {
            setEditSaving(false);
        }
    }

    async function handleToggle(tagId: Id<"StaffTags">, currentActive: boolean) {
        try {
            if (currentActive) {
                await deactivateTag({ tagId });
                toast.success("タグを無効にしました");
            } else {
                await activateTag({ tagId });
                toast.success("タグを有効にしました");
            }
        } catch {
            toast.error("タグの切り替えに失敗しました");
        }
    }

    if (tags === undefined) {
        return (
            <div className="container mx-auto space-y-6 px-6 py-10">
                <Skeleton className="h-8 w-48" />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        タグ管理
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        顧客に付与するタグを管理します。タグは事前に定義が必要です。
                    </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus className="size-4" />
                    新規作成
                </Button>
            </div>

            {tags.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                        <Tag className="text-muted-foreground size-10" />
                        <p className="text-muted-foreground text-sm">
                            タグがまだありません。「新規作成」で追加してください。
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {tags.map((tag) => (
                        <Card
                            key={tag._id}
                            className={tag.isActive ? "" : "opacity-50"}
                        >
                            <CardContent className="flex items-center gap-4 py-4">
                                <Tag className="text-muted-foreground size-5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">
                                            {tag.title}
                                        </span>
                                        <Badge
                                            variant={tag.isActive ? "default" : "outline"}
                                            className="text-[10px]"
                                        >
                                            {tag.isActive ? "有効" : "無効"}
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        {tag.description}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5"
                                        onClick={() =>
                                            setEditingTag({
                                                id: tag._id,
                                                title: tag.title,
                                                description: tag.description,
                                            })
                                        }
                                        aria-label={`「${tag.title}」のタグを編集する`}
                                        title={`「${tag.title}」のタグを編集する`}
                                    >
                                        <Pencil className="size-3.5" />
                                        <span>編集</span>
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-xs">
                                            {tag.isActive ? "有効" : "無効"}
                                        </span>
                                        <Switch
                                            checked={tag.isActive}
                                            onCheckedChange={(checked) =>
                                                handleToggle(tag._id, !checked)
                                            }
                                            size="default"
                                            aria-label={
                                                tag.isActive
                                                    ? `「${tag.title}」を無効にする（選択不可にします）`
                                                    : `「${tag.title}」を有効にする（選択可能にします）`
                                            }
                                            title={
                                                tag.isActive
                                                    ? "無効にする"
                                                    : "有効にする"
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 作成ダイアログ */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>タグを作成</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="tag-title">タイトル</Label>
                            <Input
                                id="tag-title"
                                value={createTitle}
                                onChange={(e) => setCreateTitle(e.target.value)}
                                placeholder="VIP"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tag-desc">説明</Label>
                            <Textarea
                                id="tag-desc"
                                value={createDesc}
                                onChange={(e) => setCreateDesc(e.target.value)}
                                placeholder="特別な対応が必要な顧客"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleCreate}
                            disabled={!createTitle.trim() || creating}
                        >
                            作成
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 編集ダイアログ */}
            <Dialog
                open={editingTag !== null}
                onOpenChange={(open) => !open && setEditingTag(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>タグを編集</DialogTitle>
                    </DialogHeader>
                    {editingTag && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">タイトル</Label>
                                <Input
                                    id="edit-title"
                                    value={editingTag.title}
                                    onChange={(e) =>
                                        setEditingTag({
                                            ...editingTag,
                                            title: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-desc">説明</Label>
                                <Textarea
                                    id="edit-desc"
                                    value={editingTag.description}
                                    onChange={(e) =>
                                        setEditingTag({
                                            ...editingTag,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            onClick={handleUpdate}
                            disabled={
                                !editingTag?.title.trim() || editSaving
                            }
                        >
                            保存
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
