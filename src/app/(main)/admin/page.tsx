import { Users, Link2 } from "lucide-react";
import { Link } from "@/components/link";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    管理パネル
                </h1>
                <p className="text-muted-foreground text-sm">
                    最高管理者向けの管理機能です。
                </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/users" className="block">
                    <Card className="hover:border-foreground/20 h-full transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="size-5 text-amber-500" />
                                ユーザー管理
                            </CardTitle>
                            <CardDescription>
                                全ユーザーの一覧・ロール変更・テナント割当・詳細確認。admin
                                ロールの割り当ても可能です。
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/links" className="block">
                    <Card className="hover:border-foreground/20 h-full transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Link2 className="size-5 text-teal-500" />
                                リンク集
                            </CardTitle>
                            <CardDescription>
                                Google Analytics・Vercel・Clerk・Stripe
                                など外部サービスの管理ページへ。
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
