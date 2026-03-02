"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { Tag, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export type StaffTagItem = {
    _id: Id<"StaffTags">;
    title: string;
    description: string;
    color: string;
};

type StaffTagsCardProps = {
    clerkUserId: string;
    initialTagIds: Id<"StaffTags">[];
    allTags: StaffTagItem[] | undefined;
};

export function StaffTagsCard({
    clerkUserId,
    initialTagIds,
    allTags,
}: StaffTagsCardProps) {
    const setStaffTags = useMutation(api.userProfiles.setStaffTags);
    const [selectedTags, setSelectedTags] = React.useState<Set<string>>(
        new Set(),
    );
    const [initialized, setInitialized] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        if (initialTagIds && !initialized) {
            setSelectedTags(new Set(initialTagIds));
            setInitialized(true);
        }
    }, [initialTagIds, initialized]);

    const currentSet = new Set(initialTagIds ?? []);
    const isDirty =
        selectedTags.size !== currentSet.size ||
        [...selectedTags].some((t) => !currentSet.has(t as Id<"StaffTags">));

    function toggleTag(tagId: string) {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tagId)) next.delete(tagId);
            else next.add(tagId);
            return next;
        });
    }

    function handleSave() {
        startTransition(async () => {
            try {
                await setStaffTags({
                    clerkUserId,
                    tagIds: Array.from(selectedTags) as Id<"StaffTags">[],
                });
                toast.success("タグを保存しました");
            } catch {
                toast.error("タグの保存に失敗しました");
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="size-4" />
                    タグ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {allTags && allTags.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {allTags.map((tag) => (
                            <label
                                key={tag._id}
                                className="hover:bg-accent/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors select-none"
                            >
                                <Checkbox
                                    checked={selectedTags.has(tag._id)}
                                    onCheckedChange={() => toggleTag(tag._id)}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                        {tag.title}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {tag.description}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        タグが定義されていません。会社管理 &gt;
                        タグ管理から作成してください。
                    </p>
                )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                    {allTags
                        ?.filter((t) => selectedTags.has(t._id))
                        .map((t) => (
                            <Badge
                                key={t._id}
                                variant="secondary"
                                className="gap-1 text-xs"
                            >
                                <span
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: t.color }}
                                />
                                {t.title}
                            </Badge>
                        ))}
                </div>
                <Button
                    size="sm"
                    disabled={!isDirty || isPending}
                    onClick={handleSave}
                    className="min-w-28"
                >
                    {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Save className="size-4" />
                    )}
                    <span>{isPending ? "保存中..." : "保存"}</span>
                </Button>
            </CardFooter>
        </Card>
    );
}
