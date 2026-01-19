"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

type ActivateOrganizationAndRedirectProps = {
    organizationId: string;
    redirectTo?: string;
};

export default function ActivateOrganizationAndRedirect({
    organizationId,
    redirectTo,
}: ActivateOrganizationAndRedirectProps) {
    const clerk = useClerk();
    const router = useRouter();
    // Clerk SDK の準備完了フラグ。読み込み完了前に API を呼ばない。
    const isLoaded = clerk.loaded;

    useEffect(() => {
        let isMounted = true;
        // 最終的な遷移先を一度だけ決め、リトライやフォールバックで使い回す。
        const targetPath = redirectTo ?? `/${organizationId}`;
        // Clerk API を短時間に叩き過ぎないための簡単なバックオフ。
        const sleep = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const run = async () => {
            // Clerk の準備ができてからセッション/ユーザー操作を行う。
            if (!isLoaded) {
                return;
            }

            // 参加情報がフロント側に伝播するまで数回リトライする。
            const maxAttempts = 6;

            for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
                if (!isMounted) {
                    return;
                }

                try {
                    // 新しい membership が見えるように Clerk のリソースを再取得。
                    await Promise.all([
                        clerk.session?.reload(),
                        clerk.user?.reload(),
                    ]);
                    // ユーザーの membership 一覧を取得して参加が反映されたか確認する。
                    const memberships =
                        await clerk.user?.getOrganizationMemberships({
                            pageSize: 50,
                        });
                    // 参加した組織が一覧に含まれていることを確認してからアクティブ化する。
                    const hasMembership = memberships?.data.some(
                        (membership) =>
                            membership.organization.id === organizationId,
                    );

                    if (hasMembership) {
                        // このセッションのアクティブ組織を更新してから遷移する。
                        await clerk.setActive({
                            organization: organizationId,
                        });
                        if (!isMounted) {
                            return;
                        }
                        router.replace(targetPath);
                        return;
                    }
                } catch (error) {
                    // 伝播の遅延など一時的な失敗を想定してログを残しリトライ継続。
                    console.error(
                        "[ActivateOrganizationAndRedirect] Failed to activate organization",
                        error,
                    );
                }

                // Clerk 側の反映が遅い場合に負荷を下げるため少しずつ待ち時間を増やす。
                await sleep(300 * (attempt + 1));
            }

            // 最終フォールバック：アクティブ化に失敗しても遷移だけは行う。
            if (isMounted) {
                router.replace(targetPath);
            }
        };

        run();

        return () => {
            // アンマウント後に状態更新/遷移をしないようにする。
            isMounted = false;
        };
    }, [clerk, isLoaded, organizationId, redirectTo, router]);

    return (
        <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <h1 className="text-2xl font-semibold justify-center flex items-center gap-2">
                組織へ参加中
                <Spinner />
            </h1>
            <p className="text-muted-foreground">
                参加した組織をアクティブにしています。まもなく移動します。
            </p>
        </main>
    );
}
