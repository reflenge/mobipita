/**
 * ストアフロント（Connected Account ごと 1 ページ）
 *
 * URL に Connected Account ID を使用しています。
 * 本番では tenantId や shopId など別の識別子を URL に使うことを推奨します。
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Price = {
    id: string;
    unit_amount: number | null;
    currency: string;
};

type Product = {
    id: string;
    name: string;
    description: string | null;
    default_price?: string | Price | null;
};

export default function ConnectStorePage() {
    const params = useParams();
    const accountId = params.accountId as string;
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!accountId) return;
        fetch(
            `/api/connect/products?accountId=${encodeURIComponent(accountId)}`,
        )
            .then((r) => r.json())
            .then((data) => {
                setProducts(data.products ?? []);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [accountId]);

    const getPriceId = (p: Product): string | null => {
        const def = p.default_price;
        if (typeof def === "string") return def;
        if (def && typeof def === "object" && "id" in def)
            return (def as Price).id;
        return null;
    };

    const handleBuy = async (product: Product) => {
        const priceId = getPriceId(product);
        if (!priceId) {
            toast.error("この商品は購入できません");
            return;
        }
        setCheckoutLoading(product.id);
        try {
            const res = await fetch("/api/connect/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId,
                    lineItems: [{ priceId, quantity: 1 }],
                    applicationFeeAmount: 100,
                }),
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || res.statusText);
            if (data.url) window.location.href = data.url;
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Checkout failed");
        } finally {
            setCheckoutLoading(null);
        }
    };

    if (!accountId) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8">
                <p className="text-muted-foreground">
                    ストア ID がありません。
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8">
                <p className="text-muted-foreground">読み込み中…</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
            <h1 className="text-xl font-semibold">ストア</h1>
            {products.length === 0 ? (
                <p className="text-muted-foreground">商品はまだありません。</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {products.map((p) => {
                        const priceId = getPriceId(p);
                        const price =
                            p.default_price &&
                            typeof p.default_price === "object" &&
                            p.default_price
                                ? (p.default_price as Price)
                                : null;
                        return (
                            <li
                                key={p.id}
                                className="bg-card flex flex-col rounded-lg border p-4"
                            >
                                <h2 className="font-medium">{p.name}</h2>
                                {p.description && (
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {p.description}
                                    </p>
                                )}
                                {price && (
                                    <p className="mt-2 text-sm">
                                        {price.currency.toUpperCase()}{" "}
                                        {price.unit_amount != null
                                            ? price.unit_amount.toLocaleString()
                                            : "—"}
                                    </p>
                                )}
                                <Button
                                    className="mt-auto"
                                    size="sm"
                                    disabled={
                                        !priceId || checkoutLoading !== null
                                    }
                                    onClick={() => handleBuy(p)}
                                >
                                    {checkoutLoading === p.id
                                        ? "リダイレクト中…"
                                        : "購入する"}
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
