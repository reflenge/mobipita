import "server-only";

import Stripe from "stripe";

// ビルド時（環境変数未設定）にインスタンス化が走らないよう遅延初期化
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error("STRIPE_SECRET_KEY is not set");
        }
        _stripe = new Stripe(key);
    }
    return _stripe;
}

/** @deprecated getStripe() を使用してください */
export const stripe = new Proxy({} as Stripe, {
    get(_, prop) {
        return (getStripe() as unknown as Record<string | symbol, unknown>)[
            prop
        ];
    },
});
