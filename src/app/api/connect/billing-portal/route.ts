/**
 * Stripe Connect: Billing Portal セッション
 *
 * Connected Account がサブスクリプションを管理するためのポータル URL を発行します。
 * POST body: { accountId, returnUrl? }
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
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        const returnUrl =
            typeof body.returnUrl === 'string' && body.returnUrl
                ? body.returnUrl
                : `${baseUrl}/connect`

        const stripeClient = getStripeClient()

        const session = await stripeClient.billingPortal.sessions.create({
            customer_account: accountId,
            return_url: returnUrl,
        })

        const url = session.url ?? (session as { url?: string }).url
        if (!url) {
            return NextResponse.json(
                { error: 'Failed to get portal URL' },
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
