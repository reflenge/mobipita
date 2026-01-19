import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import OrganizationMembershipList from "@/components/organizations/OrganizationMembershipList";
import { Button } from "@/components/ui/button";

const highlights = [
    {
        title: "10分刻みで稼働率を最適化",
        description: "予約枠を細かく設計し、ピーク帯の取りこぼしを削減。",
    },
    {
        title: "到着のズレを最小化",
        description: "指定場所・時間に合わせた運用で、クレームリスクを抑制。",
    },
    {
        title: "現場と本部の情報同期",
        description: "移動状況と予約状況を一元化し、指示の行き違いを防止。",
    },
];

const features = [
    {
        title: "運用KPIを可視化",
        description:
            "予約消化率・遅延率・稼働率をダッシュボードで把握。改善の指標を明確に。",
        tag: "可視化",
    },
    {
        title: "10分単位のスロット設計",
        description:
            "需要に合わせて枠を調整し、スタッフ稼働と売上機会を最大化。",
        tag: "効率",
    },
    {
        title: "現場負荷を減らす通知設計",
        description:
            "到着前アラートで現場準備がスムーズ。クレーム発生率を低減。",
        tag: "品質",
    },
];

const steps = [
    {
        step: "01",
        title: "運用条件を登録",
        description:
            "場所・稼働時間・予約枠を設定。現場の制約に合わせた設計が可能。",
    },
    {
        step: "02",
        title: "予約と移動状況を監視",
        description:
            "本部と現場が同じ情報を確認。遅延や混雑の兆候を早期に把握。",
    },
    {
        step: "03",
        title: "通知とリカバリー",
        description:
            "到着通知・遅延アラートでリカバリーを自動化し、品質を維持。",
    },
];

const schedule = [
    { time: "09:20", spot: "中央公園前", status: "空き" },
    { time: "09:30", spot: "図書館前", status: "残り2枠" },
    { time: "09:40", spot: "川沿いプロムナード", status: "空き" },
];

export default function Home() {
    return (
        <div className="relative overflow-hidden [--accent:oklch(0.78_0.12_55)] [--accent-soft:oklch(0.96_0.03_55)] [--accent-2:oklch(0.7_0.12_190)] [--accent-2-soft:oklch(0.95_0.04_190)]">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-24 top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_top,var(--accent),transparent_70%)] opacity-35 blur-3xl" />
                <div className="absolute -right-20 top-16 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_top,var(--accent-2),transparent_70%)] opacity-30 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[length:26px_26px] opacity-25" />
            </div>

            <header className="sticky top-0 z-20 border-b border-foreground/10 bg-white/70 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="group flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-xs font-semibold text-white shadow-sm transition group-hover:scale-[1.02]">
                            MP
                        </span>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold tracking-tight">
                                MobiPita
                            </span>
                            <span className="text-[0.65rem] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                                mobile schedule
                            </span>
                        </div>
                    </Link>
                    <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground md:flex">
                        <Link
                            href="#features"
                            className="transition hover:text-foreground"
                        >
                            特徴
                        </Link>
                        <Link
                            href="#flow"
                            className="transition hover:text-foreground"
                        >
                            流れ
                        </Link>
                        <SignedIn>
                            <Link
                                href="#memberships"
                                className="transition hover:text-foreground"
                            >
                                組織
                            </Link>
                        </SignedIn>
                        <SignedOut>
                            <Link
                                href="#get-started"
                                className="transition hover:text-foreground"
                            >
                                はじめる
                            </Link>
                        </SignedOut>
                    </nav>
                    <div className="flex items-center gap-2">
                        <SignedOut>
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full"
                            >
                                <Link href="/sign-up">無料で始める</Link>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="rounded-full"
                            >
                                <Link href="/sign-in">ログイン</Link>
                            </Button>
                        </SignedOut>
                        <SignedIn>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="rounded-full bg-white/80"
                            >
                                <Link href="#memberships">組織へ</Link>
                            </Button>
                            <UserButton />
                        </SignedIn>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-16">
                <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 motion-reduce:animate-none">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-4 py-1 text-[0.65rem] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                            Ops Scheduling
                        </span>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                                移動型ビジネスの運用を、
                                <span className="text-foreground/70">10分単位で最適化。</span>
                            </h1>
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                                「Mobile（移動）」+「Pita（ピタッと決まる・合わせる）」。
                                予約・移動・通知を一体化し、現場運用のズレを抑えながら
                                収益性と顧客体験を両立します。
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <SignedOut>
                                <Button asChild size="lg" className="rounded-full">
                                    <Link href="/sign-up">導入相談を始める</Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full bg-white/80"
                                >
                                    <Link href="/sign-in">担当者ログイン</Link>
                                </Button>
                            </SignedOut>
                            <SignedIn>
                                <Button asChild size="lg" className="rounded-full">
                                    <Link href="#memberships">
                                        組織を選ぶ
                                    </Link>
                                </Button>
                            </SignedIn>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            {highlights.map((item, index) => (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-foreground/10 bg-white/75 p-4 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none"
                                    style={{ animationDelay: `${150 + index * 120}ms` }}
                                >
                                    <p className="text-sm font-semibold">
                                        {item.title}
                                    </p>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative grid gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 motion-reduce:animate-none">
                        <div className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-lg backdrop-blur-md">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold">
                                    本日の稼働スロット
                                </p>
                                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-amber-950">
                                    10分刻み
                                </span>
                            </div>
                            <div className="mt-4 grid gap-3">
                                {schedule.map((slot) => (
                                    <div
                                        key={`${slot.time}-${slot.spot}`}
                                        className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-white/90 px-4 py-3 text-sm"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold">
                                                {slot.time}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {slot.spot}
                                            </span>
                                        </div>
                                        <span className="rounded-full bg-[var(--accent-2-soft)] px-3 py-1 text-xs text-foreground">
                                            {slot.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 rounded-2xl border border-dashed border-foreground/20 bg-white/60 p-4">
                                <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
                                    eta
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    13:40 / 中央公園前 到着見込み
                                </p>
                                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]" />
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-foreground/10 bg-white/80 p-4">
                                <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
                                    alert
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    現場への事前アラート
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    到着10分前の通知で、準備の遅れを防ぎます。
                                </p>
                            </div>
                            <div className="rounded-2xl border border-foreground/10 bg-white/80 p-4">
                                <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
                                    route
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    移動ルートを本部で可視化
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    現場の状況把握を早め、指示の精度を上げます。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="grid gap-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-mono uppercase tracking-[0.35em] text-muted-foreground">
                                WHY MOBIPITA
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                                本部と現場のズレをなくす運用設計
                            </h2>
                        </div>
                        <p className="max-w-md text-sm text-muted-foreground">
                            予約から到着までをひとつの運用フローに統合。時間・場所・通知を
                            一体化して、移動型ビジネスの不確実性を抑えます。
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="flex h-full flex-col gap-4 rounded-3xl border border-foreground/10 bg-white/75 p-6 shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none"
                                style={{ animationDelay: `${120 + index * 140}ms` }}
                            >
                                <span className="w-fit rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-amber-950">
                                    {feature.tag}
                                </span>
                                <h3 className="text-lg font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="flow" className="grid gap-6">
                    <div className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                            <p className="text-xs font-mono uppercase tracking-[0.35em] text-muted-foreground">
                                FLOW
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                                導入後の運用は、3ステップで完結
                            </h2>
                        </div>
                        <p className="max-w-md text-sm text-muted-foreground">
                            設定・監視・通知までを一貫して設計。担当者の負担を
                            抑えながら、品質を維持できます。
                        </p>
                    </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {steps.map((step) => (
                                <div
                                    key={step.step}
                                    className="rounded-2xl border border-foreground/10 bg-white/90 p-5"
                                >
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-xs font-mono uppercase tracking-[0.35em] text-muted-foreground">
                                            {step.step}
                                        </span>
                                        <h3 className="text-base font-semibold">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <SignedIn>
                    <section
                        id="memberships"
                        className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
                    >
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold">
                                管理中の組織
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                運用中の組織を選択して、予約管理に進めます。
                            </p>
                        </div>
                        <OrganizationMembershipList
                            title="所属組織"
                            className="min-h-0 max-w-none px-0 py-0"
                        />
                    </section>
                </SignedIn>

                <SignedOut>
                    <section
                        id="get-started"
                        className="grid gap-4 rounded-3xl border border-foreground/10 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm"
                    >
                        <h2 className="text-2xl font-semibold">
                            導入相談から、運用改善へ
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            現場の運用課題やKPIをヒアリングし、最適な設定をご提案します。
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button asChild size="lg" className="rounded-full">
                                <Link href="/sign-up">導入相談を申し込む</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="rounded-full bg-white/80"
                            >
                                <Link href="/sign-in">担当者ログイン</Link>
                            </Button>
                        </div>
                    </section>
                </SignedOut>
            </main>
        </div>
    );
}
