import { Link } from "@/components/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Store, Link2 } from "lucide-react";

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
                <Link href="/admin/roles" className="block">
                    <Card className="hover:border-foreground/20 h-full transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="size-5 text-amber-500" />
                                ロール管理
                            </CardTitle>
                            <CardDescription>
                                全ユーザーのロールを管理します。全ロールを割り当て可能です。
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/assignment" className="block">
                    <Card className="hover:border-foreground/20 h-full transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Store className="size-5 text-blue-500" />
                                テナント割当
                            </CardTitle>
                            <CardDescription>
                                スタッフをテナントに割り当てます。
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/company" className="block">
                    <Card className="hover:border-foreground/20 h-full transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="size-5 text-violet-500" />
                                会社管理
                            </CardTitle>
                            <CardDescription>
                                テナント管理・従業員一覧など、会社管理機能へ移動します。
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
                                Google Analytics・Vercel・Clerk・Stripe など外部サービスの管理ページへ。
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
