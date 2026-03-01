"use client";

import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomerMemoCardProps = {
    customerMemo: string;
};

export function CustomerMemoCard({ customerMemo }: CustomerMemoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <User className="size-4" />
                    顧客メモ（本人記入）
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground bg-muted/50 min-h-16 rounded-md p-3 text-sm whitespace-pre-wrap">
                    {customerMemo || "メモなし"}
                </p>
            </CardContent>
        </Card>
    );
}
