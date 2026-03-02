# Stripe Connect 統合

このドキュメントは、サンプル Stripe Connect 統合で使用する環境変数とセットアップの概要です。

## 環境変数 (.env.local)

| 変数名                               | 説明                                               | 例            |
| ------------------------------------ | -------------------------------------------------- | ------------- |
| `STRIPE_SECRET_KEY`                  | Stripe シークレットキー（必須）                    | `sk_test_...` |
| `STRIPE_CONNECT_WEBHOOK_SECRET`      | Connect 用 Webhook シークレット（Thin イベント用） | `whsec_...`   |
| `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET` | サブスクリプション用 Webhook シークレット          | `whsec_...`   |
| `STRIPE_PLATFORM_PRICE_ID`           | プラットフォームサブスクリプションの Price ID      | `price_...`   |

未設定または `*_placeholder` で始まる値はエラーメッセージで案内されます。

## 主なフロー

1. **Connected Account 作成**  
   V2 API で `display_name`, `contact_email`, `identity.country`, `dashboard: 'full'`, `defaults.responsibilities`, `configuration.merchant.capabilities` のみ使用（トップレベルの `type` は使用しない）。

2. **オンボーディング**  
   V2 Account Links API で `use_case.type: 'account_onboarding'`, `configurations: ['merchant', 'customer']` を指定。

3. **商品作成・一覧**  
   すべてのリクエストで `Stripe-Account` ヘッダー（`stripeAccount` オプション）に Connected Account ID を指定。

4. **決済**  
   Hosted Checkout で Direct Charge。`payment_intent_data.application_fee_amount` でプラットフォーム手数料を指定。

5. **サブスクリプション**  
   `checkout.sessions.create` に `customer_account: connectedAccountId` を指定。請求管理は `billingPortal.sessions.create` の `customer_account` でポータル URL を発行。

## Webhook

- **Thin イベント** (`/api/webhooks/stripe-connect`)
    - イベント: `v2.core.account[requirements].updated`, `v2.core.account[configuration.merchant].capability_status_updated` 等
    - ダッシュボードで「Connected accounts」向けに Event destination を追加し、Payload style を **Thin** に設定。
    - ローカル:  
      `stripe listen --thin-events 'v2.core.account[requirements].updated,...' --forward-thin-to http://localhost:3000/api/webhooks/stripe-connect`

- **サブスクリプション** (`/api/webhooks/stripe-subscriptions`)
    - スナップショット形式。`customer.subscription.updated`, `customer.subscription.deleted` 等を処理。
    - 状態の永続化は Convex の `stripeConnect.upsertSubscriptionStatus` / `removeSubscriptionStatus` を Webhook から呼ぶ形で実装可能（要サーバー用 Convex クライアントまたは HTTP Action）。

## ストアフロント URL

- ストア: `/connect/store/[accountId]`
- 本番では URL に `accountId` ではなく tenantId や shopId などの識別子を使うことを推奨。

## 参考

- [Stripe Connect 認証](https://docs.stripe.com/connect/authentication)
- [Webhooks (Thin)](https://docs.stripe.com/webhooks?snapshot-or-thin=thin)
- [V2 Core Accounts](https://docs.stripe.com/api/v2/core/accounts)
