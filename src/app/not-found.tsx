import { SignedOut } from "@clerk/nextjs";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="relative overflow-hidden [--accent-2-soft:oklch(0.95_0.04_190)] [--accent-2:oklch(0.7_0.12_190)] [--accent-soft:oklch(0.96_0.03_55)] [--accent:oklch(0.78_0.12_55)]">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -left-16 h-72 w-[18rem] rounded-full bg-[radial-gradient(circle_at_top,var(--accent),transparent_70%)] opacity-30 blur-3xl" />
                <div className="absolute top-16 -right-20 h-72 w-[18rem] rounded-full bg-[radial-gradient(circle_at_top,var(--accent-2),transparent_70%)] opacity-25 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[length:26px_26px] opacity-20" />
            </div>

            <main className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col gap-10 px-6 py-16">
                <section className="border-foreground/10 rounded-3xl border bg-white/80 p-8 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-xl">
                            <p className="text-muted-foreground font-mono text-5xl tracking-[0.35em] uppercase">
                                404 Not Found
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                                ページが見つかりません
                            </h1>
                            <p className="text-muted-foreground mt-3 text-sm">
                                URLが変更されたか、削除された可能性があります。
                                まずはトップページから目的の画面を探してください。
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild size="lg" className="rounded-full">
                                <Link href="/">トップへ戻る</Link>
                            </Button>
                            <SignedOut>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full bg-white/80"
                                >
                                    <Link href="/sign-in">担当者ログイン</Link>
                                </Button>
                            </SignedOut>
                        </div>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="border-foreground/10 rounded-2xl border bg-white/90 p-4">
                            <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
                                tip
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                ブックマークを確認
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                古いURLの場合はトップから最新の導線へ。
                            </p>
                        </div>
                        <div className="border-foreground/10 rounded-2xl border bg-white/90 p-4">
                            <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
                                support
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                運用アカウントへ戻る
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                組織の管理画面へ移動して再開できます。
                            </p>
                        </div>
                        <div className="border-foreground/10 rounded-2xl border bg-white/90 p-4">
                            <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
                                contact
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                                導入に関する相談
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                新規相談の方はトップの導入案内へ。
                            </p>
                        </div>
                    </div>
                </section>

                {/* <SignedIn>
                    <section className="rounded-3xl border border-foreground/10 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold">
                                管理中の組織に戻る
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                利用中の組織を選択して運用画面へ戻れます。
                            </p>
                        </div>
                        <OrganizationMembershipList />
                    </section>
                </SignedIn> */}
            </main>
        </div>
    );
}
