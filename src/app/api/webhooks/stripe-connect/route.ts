/**
 * Stripe Connect: Thin イベント用 Webhook
 *
 * イベント種別:
 * - v2.core.account[requirements].updated … 要件変更時に収集すべき項目の更新
 * - v2.core.account[configuration.merchant].capability_status_updated
 * - v2.core.account[configuration.customer].capability_status_updated
 *
 * ダッシュボードで Event destination を追加する際:
 * - Events from: Connected accounts
 * - Payload style: Thin
 * - イベント: v2.account[requirements].updated および
 *   v2.account[configuration.configuration_type].capability_status_updated
 *
 * ローカルテスト:
 * stripe listen --thin-events 'v2.core.account[requirements].updated,...' --forward-thin-to http://localhost:3000/api/webhooks/stripe-connect
 */

import { NextResponse } from 'next/server'
import { getStripeClient, getStripeConnectWebhookSecret } from '@/lib/stripe-connect'

export async function POST(req: Request) {
    const rawBody = await req.text()
    const sig = req.headers.get('stripe-signature') ?? ''

    try {
        const secret = getStripeConnectWebhookSecret()
        const stripeClient = getStripeClient()

        // Thin イベント: ペイロードは最小限。SDK に parseThinEvent がある場合はそれを使用する。
        // stripe-node で thin 用の検証が別の場合は、ここで署名検証を実装する。
        let eventId: string | undefined
        try {
            const parsed = JSON.parse(rawBody) as { id?: string; type?: string }
            eventId = parsed?.id
            if (!eventId || typeof eventId !== 'string') {
                return NextResponse.json(
                    { error: 'Invalid thin event: missing id' },
                    { status: 400 }
                )
            }
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            )
        }

        // 署名検証: Thin イベントも同じ v1 形式で送られる場合がある
        try {
            stripeClient.webhooks.constructEventAsync(
                rawBody,
                sig,
                secret,
                300
            )
        } catch (verifyErr) {
            console.error('[Stripe Connect Webhook] Signature verification failed:', verifyErr)
            return NextResponse.json(
                { error: 'Webhook signature verification failed' },
                { status: 400 }
            )
        }

        // 完全なイベントを取得して種別で分岐
        const event = await stripeClient.v2.core.events.retrieve(eventId)
        const eventObj = event as unknown as { type?: string }
        const eventType = eventObj?.type ?? ''

        if (eventType.includes('requirements') && eventType.includes('updated')) {
            // v2.core.account[requirements].updated
            // 要件が変更されたので、必要に応じてアカウントに追加情報の入力を促す
            // TODO: 必要なら DB に requirements 状態を保存し、ダッシュボードで表示
            console.log('[Stripe Connect Webhook] Account requirements updated:', eventId)
        } else if (
            eventType.includes('capability_status_updated')
        ) {
            // v2.core.account[configuration.merchant].capability_status_updated 等
            // キャパビリティの有効/無効が変わった
            console.log('[Stripe Connect Webhook] Capability status updated:', eventId, eventType)
        } else {
            console.log('[Stripe Connect Webhook] Unhandled event type:', eventType)
        }

        return NextResponse.json({ received: true }, { status: 200 })
    } catch (err) {
        console.error('[Stripe Connect Webhook] Error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
