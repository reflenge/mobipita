"use client";

import type { Doc } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import type { EditTagForm } from "./types";

type TagCardProps = {
    tag: Doc<"StaffTags">;
    onEdit: (form: EditTagForm) => void;
    onToggle: (tagId: Doc<"StaffTags">["_id"], currentActive: boolean) => void;
};

export function TagCard({ tag, onEdit, onToggle }: TagCardProps) {
    return (
        <Card className={tag.isActive ? "" : "opacity-50"}>
            <CardHeader className="flex items-center gap-4 py-4">
                <span
                    className="size-5 shrink-0 rounded-full border"
                    style={{ backgroundColor: tag.color }}
                />
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
            </CardHeader>
            <CardFooter className="flex shrink-0 items-center gap-3 justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                        onEdit({
                            id: tag._id,
                            title: tag.title,
                            description: tag.description,
                            color: tag.color,
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
                            onToggle(tag._id, !checked)
                        }
                        size="default"
                        aria-label={
                            tag.isActive
                                ? `「${tag.title}」を無効にする（選択不可にします）`
                                : `「${tag.title}」を有効にする（選択可能にします）`
                        }
                        title={
                            tag.isActive ? "無効にする" : "有効にする"
                        }
                    />
                </div>
            </CardFooter>
        </Card>
    );
}
