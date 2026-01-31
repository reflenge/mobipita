import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { Settings, ArrowRight, AlertTriangle } from "lucide-react";
import Image from "next/image";
import OrganizationSwitcherImage from "../_assets/OrganizationSwitcher.png";
import OrganizationProfileImage from "../_assets/OrganizationProfile.png";

export const StaffUpgrade = () => {
    return (
        <section className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Customer から従業員へ昇格する
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    組織に参加しただけの「Customer」を、店舗やテナントで作業できる「Member」、または組織全体を管理できる「Admin」に昇格させます。昇格したメンバーは「各テナントへ振り分け」でテナントに割り当てられます。
                </p>
            </div>

            <ol className="grid gap-6 md:grid-cols-1">
                <li>
                    <Card>
                        <CardHeader className="gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    1
                                </span>
                                組織の管理画面を開く
                            </CardTitle>
                            <CardDescription>
                                画面上部の組織切り替えから、対象の組織を選びます。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-2">
                            <OrganizationSwitcher hidePersonal={true} defaultOpen />
                        </CardContent>
                    </Card>
                </li>

                <li>
                    <Card>
                        <CardHeader className="gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    2
                                </span>
                                「組織の管理」を開く
                            </CardTitle>
                            <CardDescription>
                                選択した組織の左側にある「組織の管理」ボタンをクリックし、Clerk の組織管理画面へ進みます。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="pointer-events-none"
                                >
                                    <Settings className="size-4" />
                                    組織の管理
                                </Button>
                                <span className="text-muted-foreground">
                                    をクリック
                                </span>
                            </div>
                            <Image
                                src={OrganizationSwitcherImage}
                                alt="組織切り替えと組織の管理の位置"
                                width={400}
                                height={200}
                                className="rounded-md border bg-muted/30"
                            />
                        </CardContent>
                    </Card>
                </li>

                <li>
                    <Card>
                        <CardHeader className="gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    3
                                </span>
                                「メンバー」を開く
                            </CardTitle>
                            <CardDescription>
                                PC の場合は左サイドの「組織」メニューから、スマホの場合は左上のハンバーガーメニュー「組織」から「メンバー」を選択します。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Image
                                src={OrganizationProfileImage}
                                alt="組織メニューとメンバー"
                                width={400}
                                height={200}
                                className="rounded-md border bg-muted/30"
                            />
                        </CardContent>
                    </Card>
                </li>

                <li>
                    <Card>
                        <CardHeader className="gap-1">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    4
                                </span>
                                ロールを変更する
                            </CardTitle>
                            <CardDescription>
                                メンバー一覧から、昇格させたいユーザーのロールを変更します。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="list-inside space-y-1.5 text-sm">
                                <li>
                                    <strong>Member</strong> … 店舗・テナントで作業できる従業員向け
                                </li>
                                <li>
                                    <strong>Admin</strong> … 組織全体の設定やメンバー管理ができる管理者向け
                                </li>
                            </ul>
                            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/50">
                                <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-500" />
                                <p className="text-amber-800 dark:text-amber-200">
                                    一般のお客さん（Customer）も一覧に表示されます。昇格させる人を間違えないよう確認してください。
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </li>
            </ol>

            <Card className="border-dashed">
                <CardContent className="flex flex-wrap items-center gap-2 py-4">
                    <ArrowRight className="size-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        昇格が終わったら、サイドバーの
                        <strong className="text-foreground">「各テナントへ振り分け」</strong>
                        で、メンバーをテナントに割り当ててください。
                    </p>
                </CardContent>
            </Card>
        </section>
    );
};
