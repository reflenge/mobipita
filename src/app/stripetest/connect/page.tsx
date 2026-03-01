/**
 * Stripe Connect ダッシュボード
 *
 * - オンボーディング: 「支払いを受け付けるためにオンボードする」ボタン + 状態表示
 * - 状態は API から直接取得（DB にキャッシュしない）
 * - 商品作成フォーム、サブスクリプション・Billing Portal へのリンク
 */

"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";

type AccountStatus = {
    readyToProcessPayments: boolean;
    onboardingComplete: boolean;
    requirementsStatus: string | null;
    cardPaymentsStatus: string | null;
};

export default function ConnectPage() {
    const accountId = useQuery(api.stripeConnect.getMyConnectAccount);
    const [status, setStatus] = useState<AccountStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);
    const setConnectAccount = useMutation(api.stripeConnect.setConnectAccount);

    // アカウント状態を API から直接取得（デモでは毎回取得）
    useEffect(() => {
        if (!accountId) {
            setStatus(null);
            return;
        }
        let cancelled = false;
        fetch(
            `/api/connect/account-status?accountId=${encodeURIComponent(accountId)}`,
            {
                credentials: "include",
            },
        )
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled) setStatus(data);
            })
            .catch(() => {
                if (!cancelled) setStatus(null);
            });
        return () => {
            cancelled = true;
        };
    }, [accountId]);

    const handleCreateAccount = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/connect/account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: "My Store",
                    contactEmail: undefined,
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            const { accountId: newId } = data;
            await setConnectAccount({ stripeAccountId: newId });
            toast.success("Connect アカウントを作成しました");
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to create account",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOnboard = async () => {
        if (!accountId) return;
        setLinkLoading(true);
        try {
            const res = await fetch("/api/connect/account-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            if (data.url) window.location.href = data.url;
            else toast.error("オンボーディング URL を取得できませんでした");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to get link");
        } finally {
            setLinkLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
            <h1 className="text-xl font-semibold">Stripe Connect</h1>

            {accountId == null && (
                <section className="bg-card rounded-lg border p-4">
                    <p className="text-muted-foreground mb-2 text-sm">
                        ​支払いを受け付けるには、まず Connect
                        アカウントを作成してください。
                    </p>
                    <Button onClick={handleCreateAccount} disabled={loading}>
                        {loading ? "作成中…" : "Connect アカウントを作成"}
                    </Button>
                </section>
            )}

            {accountId != null && (
                <>
                    <section className="bg-card rounded-lg border p-4">
                        <h2 className="mb-2 font-medium">
                            オンボーディング状態
                        </h2>
                        {status == null ? (
                            <p className="text-muted-foreground text-sm">
                                取得中…
                            </p>
                        ) : (
                            <ul className="mb-4 list-inside list-disc text-sm">
                                <li>
                                    支払い準備完了:{" "}
                                    {status.readyToProcessPayments
                                        ? "はい"
                                        : "いいえ"}
                                </li>
                                <li>
                                    オンボーディング完了:{" "}
                                    {status.onboardingComplete
                                        ? "はい"
                                        : "いいえ"}
                                </li>
                                {status.requirementsStatus && (
                                    <li>要件: {status.requirementsStatus}</li>
                                )}
                            </ul>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleOnboard}
                            disabled={linkLoading}
                        >
                            {linkLoading
                                ? "リンク取得中…"
                                : "支払いを受け付けるためにオンボードする"}
                        </Button>
                    </section>

                    <section className="bg-card rounded-lg border p-4">
                        <h2 className="mb-2 font-medium">ストア・商品</h2>
                        <p className="text-muted-foreground mb-2 text-sm">
                            商品を追加するか、ストアフロントのリンクを共有できます。
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm">
                                <a
                                    href={`/connect/products?accountId=${encodeURIComponent(accountId)}`}
                                >
                                    商品を追加
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <a href={`/connect/store/${accountId}`}>
                                    ストアを見る
                                </a>
                            </Button>
                        </div>
                    </section>

                    <section className="bg-card rounded-lg border p-4">
                        <h2 className="mb-2 font-medium">
                            プラットフォームサブスクリプション
                        </h2>
                        <p className="text-muted-foreground mb-2 text-sm">
                            プランに加入するか、請求ポータルで管理します。
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <SubscriptionCheckoutButton accountId={accountId} />
                            <BillingPortalButton accountId={accountId} />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

function SubscriptionCheckoutButton({ accountId }: { accountId: string }) {
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/connect/subscription-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            if (data.url) window.location.href = data.url;
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Checkout failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={loading}
        >
            {loading ? "…" : "プランに加入"}
        </Button>
    );
}

function BillingPortalButton({ accountId }: { accountId: string }) {
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/connect/billing-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accountId }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            if (data.url) window.location.href = data.url;
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Portal failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={loading}
        >
            {loading ? "…" : "請求を管理"}
        </Button>
    );
}
