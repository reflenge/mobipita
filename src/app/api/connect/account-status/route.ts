/**
 * Stripe Connect: アカウント状態の取得 (V2 API)
 *
 * デモでは常に API から直接取得します（DB にキャッシュしない）。
 * GET ?accountId=acct_xxx
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripeClient } from '@/lib/stripe-connect'

export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const accountId = searchParams.get('accountId')
        if (!accountId || !accountId.startsWith('acct_')) {
            return NextResponse.json(
                { error: 'Valid accountId (acct_xxx) is required' },
                { status: 400 }
            )
        }

        const stripeClient = getStripeClient()

        // V2: アカウント取得（configuration.merchant と requirements を含める）
        const account = await stripeClient.v2.core.accounts.retrieve(
            accountId,
            {
                include: ['configuration.merchant', 'requirements'],
            }
        ) as {
            configuration?: {
                merchant?: {
                    capabilities?: {
                        card_payments?: { status?: string }
                    }
                }
            }
            requirements?: {
                summary?: {
                    minimum_deadline?: { status?: string }
                }
            }
        }

        const cardPaymentsStatus =
            account?.configuration?.merchant?.capabilities?.card_payments
                ?.status
        const requirementsStatus =
            account?.requirements?.summary?.minimum_deadline?.status

        const readyToProcessPayments = cardPaymentsStatus === 'active'
        const onboardingComplete =
            requirementsStatus !== 'currently_due' &&
            requirementsStatus !== 'past_due'

        return NextResponse.json({
            readyToProcessPayments,
            onboardingComplete,
            requirementsStatus: requirementsStatus ?? null,
            cardPaymentsStatus: cardPaymentsStatus ?? null,
        })
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
