/**
 * Stripe Connect: Account Link 作成 (V2 API)
 *
 * オンボーディング用のワンタイム URL を発行します。
 * GET ?accountId=acct_xxx または POST body: { accountId: "acct_xxx" }
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripeClient } from '@/lib/stripe-connect'

function getRequestUrl(req: Request): string {
    try {
        const u = new URL(req.url)
        return `${u.origin}`
    } catch {
        return 'http://localhost:3000'
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

        const baseUrl = getRequestUrl(req)
        const stripeClient = getStripeClient()

        // V2 Account Links API: オンボーディング用リンク
        const accountLink = await stripeClient.v2.core.accountLinks.create({
            account: accountId,
            use_case: {
                type: 'account_onboarding',
                account_onboarding: {
                    configurations: ['merchant', 'customer'],
                    refresh_url: `${baseUrl}/connect`,
                    return_url: `${baseUrl}/connect?accountId=${encodeURIComponent(accountId)}`,
                },
            },
        })

        const url =
            typeof accountLink === 'object' &&
            accountLink !== null &&
            'url' in accountLink
                ? (accountLink as { url: string }).url
                : null
        if (!url) {
            return NextResponse.json(
                { error: 'Failed to get account link url' },
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
