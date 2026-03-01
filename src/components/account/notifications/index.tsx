import { Bell } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { AccountPageProps } from "..";

export function AccountNotifications(_props: AccountPageProps) {
    return (
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
            <h1 className="text-2xl font-semibold tracking-tight">お知らせ</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="size-4" />
                        お知らせ一覧
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        お知らせはありません
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
