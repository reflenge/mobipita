import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OrganizationSwitcher } from "@clerk/nextjs";
import {
    Settings,
    ArrowRight,
    AlertTriangle,
    ChevronRight,
    ShieldCheck,
    Briefcase,
    UserX,
    CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import OrganizationSwitcherImage from "../_components/_assets/OrganizationSwitcher.png";
import OrganizationProfileImage from "../_components/_assets/OrganizationProfile.png";

const STEPS = [
    {
        title: "組織を選択する",
        description:
            "以下の組織切り替えから、対象の組織を選んでください。",
    },
    {
        title: "「組織の管理」を開く",
        description:
            "組織名の横にある歯車ボタンをクリックして、管理画面を開きます。",
    },
    {
        title: "「メンバー」タブを開く",
        description:
            "管理画面内の「メンバー」を選択して、メンバー一覧を表示します。",
    },
    {
        title: "ロールを変更する",
        description:
            "昇格させたいユーザーの横にあるロール欄から、新しいロールを選びます。",
    },
] as const;

export default function UpgradePage() {
    return (
        <div className="mx-auto container flex flex-col gap-10 px-6 py-10">
            {/* ヘッダー */}
            <section className="space-y-4">
                <h1 className="text-2xl font-semibold tracking-tight">
                    従業員へ昇格する
                </h1>
                <p className="text-muted-foreground max-w-2xl text-[15px] leading-relaxed">
                    組織に参加しただけの
                    <Badge variant="outline" className="mx-1 align-middle">
                        Customer
                    </Badge>
                    を、店舗で働ける
                    <Badge variant="secondary" className="mx-1 align-middle">
                        Member
                    </Badge>
                    や、組織全体を管理できる
                    <Badge className="mx-1 align-middle">Admin</Badge>
                    に昇格させます。
                </p>
            </section>

            {/* ロール早見表 */}
            <section className="grid gap-4 sm:grid-cols-3">
                <Card className="border-dashed opacity-60">
                    <CardHeader className="gap-1 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserX className="size-4 text-muted-foreground" />
                            Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        組織に参加しただけの状態。テナントへの割り当てや管理操作はできません。
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/40 dark:border-blue-900 dark:bg-blue-950/30">
                    <CardHeader className="gap-1 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Briefcase className="size-4 text-blue-600 dark:text-blue-400" />
                            Member
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        テナントに割り当てて、店舗で作業できる従業員ロールです。
                    </CardContent>
                </Card>

                <Card className="border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/30">
                    <CardHeader className="gap-1 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="size-4 text-violet-600 dark:text-violet-400" />
                            Admin
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        組織全体の設定やメンバー管理ができる管理者ロールです。
                    </CardContent>
                </Card>
            </section>

            {/* 手順 */}
            <section className="space-y-6">
                <h2 className="text-lg font-semibold">昇格の手順</h2>

                <ol className="relative space-y-6 border-l-2 border-muted pl-8">
                    {/* Step 1 */}
                    <li className="relative">
                        <StepNumber n={1} />
                        <Card>
                            <CardHeader className="gap-1">
                                <CardTitle className="text-base">
                                    {STEPS[0].title}
                                </CardTitle>
                                <CardDescription>
                                    {STEPS[0].description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrganizationSwitcher
                                    hidePersonal={true}
                                    defaultOpen
                                />
                            </CardContent>
                        </Card>
                    </li>

                    {/* Step 2 */}
                    <li className="relative">
                        <StepNumber n={2} />
                        <Card>
                            <CardHeader className="gap-1">
                                <CardTitle className="text-base">
                                    {STEPS[1].title}
                                </CardTitle>
                                <CardDescription>
                                    {STEPS[1].description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="pointer-events-none"
                                    >
                                        <Settings className="size-4" />
                                        組織の管理
                                    </Button>
                                    <span className="text-muted-foreground">
                                        ← このボタンをクリック
                                    </span>
                                </div>
                                <Image
                                    src={OrganizationSwitcherImage}
                                    alt="組織切り替えと「組織の管理」ボタンの位置"
                                    width={400}
                                    height={200}
                                    className="rounded-md border bg-muted/30"
                                />
                            </CardContent>
                        </Card>
                    </li>

                    {/* Step 3 */}
                    <li className="relative">
                        <StepNumber n={3} />
                        <Card>
                            <CardHeader className="gap-1">
                                <CardTitle className="text-base">
                                    {STEPS[2].title}
                                </CardTitle>
                                <CardDescription>
                                    {STEPS[2].description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Image
                                    src={OrganizationProfileImage}
                                    alt="組織管理画面の「メンバー」タブの位置"
                                    width={400}
                                    height={200}
                                    className="rounded-md border bg-muted/30"
                                />
                            </CardContent>
                        </Card>
                    </li>

                    {/* Step 4 */}
                    <li className="relative">
                        <StepNumber n={4} />
                        <Card>
                            <CardHeader className="gap-1">
                                <CardTitle className="text-base">
                                    {STEPS[3].title}
                                </CardTitle>
                                <CardDescription>
                                    {STEPS[3].description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <Badge
                                        variant="outline"
                                        className="opacity-60"
                                    >
                                        Customer
                                    </Badge>
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                    <Badge variant="secondary">Member</Badge>
                                    <span className="text-muted-foreground">
                                        または
                                    </span>
                                    <Badge>Admin</Badge>
                                </div>

                                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/50">
                                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <p className="text-amber-800 dark:text-amber-200">
                                        一般のお客さん（Customer）も一覧に表示されます。
                                        <strong>
                                            昇格させる人を間違えないよう注意してください。
                                        </strong>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </li>
                </ol>
            </section>

            {/* 次のステップ */}
            <Card className="border-green-200 bg-green-50/40 dark:border-green-900 dark:bg-green-950/30">
                <CardContent className="flex flex-wrap items-center gap-3 py-4">
                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm">
                        昇格が完了したら、サイドバーの
                        <strong className="text-foreground">
                            「各テナントへ振り分け」
                        </strong>
                        でメンバーをテナントに割り当ててください。
                    </p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                </CardContent>
            </Card>
        </div>
    );
}

function StepNumber({ n }: { n: number }) {
    return (
        <span className="absolute -left-[calc(2rem+1px)] flex size-8 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary">
            {n}
        </span>
    );
}
