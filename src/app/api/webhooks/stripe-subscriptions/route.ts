/**
 * Stripe サブスクリプション Webhook（スナップショットイベント）
 *
 * サブスクリプション・請求関連のイベントを処理し、DB に状態を保存します。
 * この Webhook は Thin ではなく通常のスナップショット形式です。
 *
 * 購読: customer.subscription.updated, customer.subscription.deleted
 * その他: payment_method.attached, customer.updated 等（必要に応じて追加）
 *
 * DB があるため、Convex の upsertSubscriptionStatus / removeSubscriptionStatus を
 * 呼び出す必要があります。ここでは Webhook 検証後に Convex を呼ぶための
 * プレースホルダーを置き、実際の呼び出しは Convex HTTP Action または
 * サーバー用 Convex クライアントで実装してください。
 */

import { NextResponse } from 'next/server'
import { getStripeClient, getStripeSubscriptionWebhookSecret } from '@/lib/stripe-connect'

export async function POST(req: Request) {
    const rawBody = await req.text()
    const sig = req.headers.get('stripe-signature') ?? ''

    try {
        const secret = getStripeSubscriptionWebhookSecret()
        const stripeClient = getStripeClient()

        const event = await stripeClient.webhooks.constructEventAsync(
            rawBody,
            sig,
            secret,
            300
        )

        const typ = event.type
        const obj = event.data?.object as unknown as Record<string, unknown> | undefined

        if (typ === 'customer.subscription.updated') {
            const sub = obj as {
                id?: string
                status?: string
                cancel_at_period_end?: boolean
                customer_account?: string
                items?: { data?: Array<{ quantity?: number; price?: unknown }> }
                pause_collection?: { resumes_at?: number; behavior?: string }
            }
            const customerAccountId = sub?.customer_account
            if (customerAccountId) {
                // TODO: DB に保存。例: Convex mutation を呼ぶ
                // await convexMutation(api.stripeConnect.upsertSubscriptionStatus, {
                //   customerAccountId,
                //   stripeSubscriptionId: sub.id,
                //   status: sub.status ?? 'unknown',
                //   cancelAtPeriodEnd: sub.cancel_at_period_end,
                // });
                console.log('[Stripe Subscriptions] subscription.updated', customerAccountId, sub?.status)
            }
        } else if (typ === 'customer.subscription.deleted') {
            const sub = obj as { customer_account?: string }
            const customerAccountId = sub?.customer_account
            if (customerAccountId) {
                // TODO: DB から削除
                // await convexMutation(api.stripeConnect.removeSubscriptionStatus, {
                //   customerAccountId,
                // });
                console.log('[Stripe Subscriptions] subscription.deleted', customerAccountId)
            }
        } else if (
            typ === 'payment_method.attached' ||
            typ === 'payment_method.detached' ||
            typ === 'customer.updated' ||
            typ === 'customer.tax_id.created' ||
            typ === 'customer.tax_id.deleted' ||
            typ === 'customer.tax_id.updated' ||
            typ === 'billing_portal.configuration.created' ||
            typ === 'billing_portal.configuration.updated' ||
            typ === 'billing_portal.session.created'
        ) {
            // 必要に応じてログや DB 更新
            console.log('[Stripe Subscriptions]', typ)
        } else {
            console.log('[Stripe Subscriptions] Unhandled:', typ)
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (err) {
        console.error('[Stripe Subscriptions Webhook] Error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
