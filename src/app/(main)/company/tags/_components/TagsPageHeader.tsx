"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type TagsPageHeaderProps = {
    onCreateClick: () => void;
};

export function TagsPageHeader({ onCreateClick }: TagsPageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    タグ管理
                </h1>
                <p className="text-muted-foreground text-sm">
                    顧客に付与するタグを管理します。タグは事前に定義が必要です。
                </p>
            </div>
            <Button onClick={onCreateClick}>
                <Plus className="size-4" />
                新規作成
            </Button>
        </div>
    );
}
