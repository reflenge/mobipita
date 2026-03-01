/**
 * Stripe Connect: プラットフォームサブスクリプション用 Checkout セッション
 *
 * Connected Account がプラットフォームのプランに申し込むための Hosted Checkout。
 * V2 では customer_account に Connect アカウント ID を指定します（.customer ではない）
 *
 * POST body: { accountId, successUrl?, cancelUrl? }
 * 環境変数 STRIPE_PLATFORM_PRICE_ID に price_xxx を設定してください（未設定時はエラー）
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripeClient } from '@/lib/stripe-connect'

const PLATFORM_PRICE_ID = process.env.STRIPE_PLATFORM_PRICE_ID

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
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!PLATFORM_PRICE_ID || PLATFORM_PRICE_ID.startsWith('price_placeholder')) {
            return NextResponse.json(
                {
                    error:
                        '[Stripe Connect] STRIPE_PLATFORM_PRICE_ID が設定されていません。' +
                        ' Stripe ダッシュボードでプラットフォーム用の価格を作成し、.env.local に設定してください。',
                },
                { status: 500 }
            )
        }

        const body = await req.json().catch(() => ({}))
        const accountId =
            typeof body.accountId === 'string' ? body.accountId.trim() : null
        if (!accountId || !accountId.startsWith('acct_')) {
            return NextResponse.json(
                { error: 'Valid accountId (acct_xxx) is required' },
                { status: 400 }
            )
        }

        const baseUrl = getRequestUrl(req, '')
        const successUrl =
            typeof body.successUrl === 'string' && body.successUrl
                ? body.successUrl
                : `${baseUrl}/stripetest/connect?session_id={CHECKOUT_SESSION_ID}`
        const cancelUrl =
            typeof body.cancelUrl === 'string' && body.cancelUrl
                ? body.cancelUrl
                : `${baseUrl}/stripetest/connect`

        const stripeClient = getStripeClient()

        const session = await stripeClient.checkout.sessions.create({
            customer_account: accountId,
            mode: 'subscription',
            line_items: [{ price: PLATFORM_PRICE_ID, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
        })

        const url = session.url ?? (session as { url?: string }).url
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
