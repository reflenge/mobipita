/**
 * Stripe Connect 統合用ヘルパー
 *
 * すべての Stripe リクエストは stripeClient を使って行います。
 * API バージョンは SDK が自動で使用するため、明示的に設定しません。
 */

import "server-only";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

/**
 * 環境変数が未設定の場合にエラーを投げるヘルパー
 * プレースホルダー（未設定）の場合は分かりやすいメッセージを返します
 */
function requireEnv(
    name: string,
    value: string | undefined,
): asserts value is string {
    if (
        value === undefined ||
        value === "" ||
        value.startsWith("sk_placeholder") ||
        value.startsWith("whsec_placeholder")
    ) {
        throw new Error(
            `[Stripe Connect] 環境変数 ${name} が設定されていません。` +
                ` .env.local に正しい値を設定するか、Stripe ダッシュボードからキーを取得してください。`,
        );
    }
}

/**
 * Stripe シークレットキーを取得し、クライアントを返します。
 * すべての Stripe 関連リクエストはこの stripeClient を使ってください。
 *
 * 使用例:
 *   const stripeClient = getStripeClient()
 *   const account = await stripeClient.v2.core.accounts.create({ ... })
 *   const products = await stripeClient.products.list({}, { stripeAccount: accountId })
 */
export function getStripeClient(): Stripe {
    requireEnv("STRIPE_SECRET_KEY", STRIPE_SECRET_KEY);
    return new Stripe(STRIPE_SECRET_KEY!, {
        // SDK がデフォルトの API バージョンを使用（例: 2026-02-25.clover）
        apiVersion: undefined,
    });
}

/**
 * Connect 用 Webhook シークレット（Thin イベント用）
 * ダッシュボードで "Connected accounts" からイベントを送信する宛先を追加し、
 * Payload style で "Thin" を選択した際のシークレットを設定してください。
 */
export function getStripeConnectWebhookSecret(): string {
    const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    requireEnv("STRIPE_CONNECT_WEBHOOK_SECRET", secret);
    return secret!;
}

/**
 * サブスクリプション用 Webhook シークレット（スナップショットイベント用）
 * プラットフォームの Webhook エンドポイントで customer.subscription.* 等を
 * 受け取るためのシークレットです。
 */
export function getStripeSubscriptionWebhookSecret(): string {
    const secret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
    requireEnv("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET", secret);
    return secret!;
}
