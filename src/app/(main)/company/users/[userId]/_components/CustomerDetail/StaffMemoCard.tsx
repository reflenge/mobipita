"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Save, Loader2 } from "lucide-react";

type StaffMemoCardProps = {
    clerkUserId: string;
    initialMemo: string;
};

export function StaffMemoCard({ clerkUserId, initialMemo }: StaffMemoCardProps) {
    const updateStaffMemo = useMutation(api.userProfiles.updateStaffMemo);
    const [staffMemo, setStaffMemo] = React.useState(initialMemo);
    const [initialized, setInitialized] = React.useState(false);
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
        if (initialMemo !== undefined && !initialized) {
            setStaffMemo(initialMemo);
            setInitialized(true);
        }
    }, [initialMemo, initialized]);

    const isDirty = staffMemo !== initialMemo;

    function handleSave() {
        startTransition(async () => {
            try {
                await updateStaffMemo({ clerkUserId, staffMemo });
                toast.success("スタッフメモを保存しました");
            } catch {
                toast.error("保存に失敗しました");
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="size-4" />
                    スタッフメモ
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea
                    value={staffMemo}
                    onChange={(e) => setStaffMemo(e.target.value)}
                    placeholder="スタッフ間で共有するメモ（顧客には表示されません）"
                    rows={4}
                />
            </CardContent>
            <CardFooter className="flex justify-end">
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
