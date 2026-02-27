import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart3,
    Eye,
    Cloud,
    Database,
    UserCog,
    CreditCard,
    ExternalLink,
} from "lucide-react";

// セキュリティ上の理由から、個別プロジェクトの詳細リンクではなく、共通のダッシュボードURLのみを記載しています。
const EXTERNAL_LINKS = [
    {
        title: "Google Analytics",
        description: "ウェブサイトのアクセス解析・レポート",
        href: "https://analytics.google.com/",
        icon: BarChart3,
        iconColor: "text-amber-500",
    },
    {
        title: "Microsoft Clarity",
        description: "ヒートマップ・セッション録画などの行動分析",
        href: "https://clarity.microsoft.com/",
        icon: Eye,
        iconColor: "text-blue-500",
    },
    {
        title: "Vercel",
        description: "デプロイ・プロジェクト・ドメイン管理",
        href: "https://vercel.com/dashboard",
        icon: Cloud,
        iconColor: "text-foreground",
    },
    {
        title: "Convex",
        description: "バックエンド・データベース・関数の管理",
        href: "https://dashboard.convex.dev/",
        icon: Database,
        iconColor: "text-emerald-500",
    },
    {
        title: "Clerk",
        description: "認証・ユーザー管理ダッシュボード",
        href: "https://dashboard.clerk.com/",
        icon: UserCog,
        iconColor: "text-violet-500",
    },
    {
        title: "Stripe",
        description: "決済・サブスクリプション・顧客管理",
        href: "https://dashboard.stripe.com/",
        icon: CreditCard,
        iconColor: "text-indigo-500",
    },
] as const;

export default function AdminLinksPage() {
    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    関連リンク集
                </h1>
                <p className="text-muted-foreground text-sm">
                    プロジェクトに関連する外部サービスのダッシュボード・管理ページへのリンクです。外部サイトは新しいタブで開きます。
                </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {EXTERNAL_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Card className="hover:border-foreground/20 flex h-full flex-col transition-all hover:shadow-md">
                                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                                    <div className="space-y-1.5">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Icon
                                                className={`size-5 shrink-0 ${item.iconColor}`}
                                            />
                                            {item.title}
                                        </CardTitle>
                                        <CardDescription>
                                            {item.description}
                                        </CardDescription>
                                    </div>
                                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <span className="text-muted-foreground text-xs">
                                        {new URL(item.href).hostname}
                                    </span>
                                </CardContent>
                            </Card>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
