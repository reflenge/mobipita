"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import {
    TagsPageHeader,
    TagsEmptyState,
    TagCard,
    CreateTagDialog,
    EditTagDialog,
} from "./_components";
import type { EditTagForm } from "./_components";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function TagsPage() {
    const tags = useQuery(api.staffTags.listAll);
    const createTag = useMutation(api.staffTags.create);
    const updateTag = useMutation(api.staffTags.update);
    const deactivateTag = useMutation(api.staffTags.deactivate);
    const activateTag = useMutation(api.staffTags.activate);

    const [showCreate, setShowCreate] = React.useState(false);
    const [isCreatePending, startCreateTransition] = React.useTransition();

    const [editingTag, setEditingTag] = React.useState<EditTagForm | null>(
        null,
    );
    const [isEditPending, startEditTransition] = React.useTransition();

    function handleCreate(values: {
        title: string;
        description: string;
        color: string;
    }) {
        startCreateTransition(async () => {
            try {
                await createTag({
                    title: values.title.trim(),
                    description: values.description.trim(),
                    color: values.color,
                });
                toast.success("タグを作成しました");
                setShowCreate(false);
            } catch {
                toast.error("タグの作成に失敗しました");
            }
        });
    }

    function handleUpdate(form: EditTagForm) {
        startEditTransition(async () => {
            try {
                await updateTag({
                    tagId: form.id,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    color: form.color,
                });
                toast.success("タグを更新しました");
                setEditingTag(null);
            } catch {
                toast.error("タグの更新に失敗しました");
            }
        });
    }

    async function handleToggle(
        tagId: Id<"StaffTags">,
        currentActive: boolean,
    ) {
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
            <TagsPageHeader onCreateClick={() => setShowCreate(true)} />

            {tags.length === 0 ? (
                <TagsEmptyState />
            ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tags.map((tag) => (
                        <TagCard
                            key={tag._id}
                            tag={tag}
                            onEdit={setEditingTag}
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            )}

            <CreateTagDialog
                open={showCreate}
                onOpenChange={setShowCreate}
                onSubmit={handleCreate}
                isPending={isCreatePending}
            />

            <EditTagDialog
                tag={editingTag}
                onOpenChange={(open) => !open && setEditingTag(null)}
                onSave={handleUpdate}
                isPending={isEditPending}
            />
        </div>
    );
}
