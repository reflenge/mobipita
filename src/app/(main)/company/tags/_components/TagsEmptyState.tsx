"use client";

import { Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TagsEmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <Tag className="text-muted-foreground size-10" />
                <p className="text-muted-foreground text-sm">
                    タグがまだありません。「新規作成」で追加してください。
                </p>
            </CardContent>
        </Card>
    );
}
