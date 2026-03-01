/**
 * Stripe Connect: チェックアウトセッション作成（Direct Charge + アプリケーション手数料）
 *
 * Hosted Checkout を使用。Connected Account に対して Direct Charge し、
 * application_fee_amount でプラットフォームが手数料を取得します。
 * POST body: { accountId, lineItems: [{ priceId, quantity }], successUrl?, cancelUrl? }
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripeClient } from '@/lib/stripe-connect'

function getRequestUrl(req: Request, path: string): string {
    try {
        const u = new URL(req.url)
        return `${u.origin}${path}`
    } catch {
        return `http://localhost:3000${path}`
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}))
        const accountId =
            typeof body.accountId === 'string' ? body.accountId.trim() : null
        const lineItems = Array.isArray(body.lineItems) ? body.lineItems : null
        const applicationFeeAmount =
            typeof body.applicationFeeAmount === 'number' && body.applicationFeeAmount >= 0
                ? Math.round(body.applicationFeeAmount)
                : 100 // サンプル: 100 セント

        if (!accountId || !accountId.startsWith('acct_')) {
            return NextResponse.json(
                { error: 'Valid accountId (acct_xxx) is required' },
                { status: 400 }
            )
        }
        if (
            !lineItems ||
            lineItems.length === 0 ||
            !lineItems.every(
                (i: unknown) =>
                    typeof i === 'object' &&
                    i !== null &&
                    'priceId' in i &&
                    typeof (i as { priceId: string }).priceId === 'string' &&
                    'quantity' in i &&
                    typeof (i as { quantity: number }).quantity === 'number'
            )
        ) {
            return NextResponse.json(
                { error: 'lineItems: [{ priceId, quantity }] is required' },
                { status: 400 }
            )
        }

        const baseUrl = getRequestUrl(req, '')
        const successUrl =
            typeof body.successUrl === 'string' && body.successUrl
                ? body.successUrl
                : `${baseUrl}/stripetest/connect/store/${accountId}/success?session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl =
            typeof body.cancelUrl === 'string' && body.cancelUrl
                ? body.cancelUrl
                : `${baseUrl}/stripetest/connect/store/${accountId}`

        const stripeClient = getStripeClient()

        const session = await stripeClient.checkout.sessions.create(
            {
                line_items: lineItems.map(
                    (i: { priceId: string; quantity: number }) => ({
                        price: i.priceId,
                        quantity: i.quantity,
                    })
                ),
                payment_intent_data: {
                    application_fee_amount: applicationFeeAmount,
                },
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
            },
            { stripeAccount: accountId }
        )

        const url =
            session.url ||
            (typeof session === 'object' && session && 'url' in session
                ? (session as { url: string | null }).url
                : null)
        if (!url) {
            return NextResponse.json(
                { error: 'Failed to get checkout URL' },
                { status: 500 }
            )
        }

        return NextResponse.json({ url })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        const statusCode =
            err &&
                typeof err === 'object' &&
                'statusCode' in err &&
                typeof (err as { statusCode?: number }).statusCode === 'number'
                ? (err as { statusCode: number }).statusCode
                : 500
        return NextResponse.json({ error: message }, { status: statusCode })
    }
}
