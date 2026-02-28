/**
 * Stripe Connect: Connected Account 作成 (V2 API)
 *
 * リクエスト body: { displayName?: string, contactEmail?: string }
 * レスポンス: { accountId: string } — クライアントで setConnectAccount mutation に渡す
 *
 * トップレベルで type: 'express' | 'standard' | 'custom' は使用しません（V2 では不要）
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripeClient } from '@/lib/stripe-connect'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        const displayName =
            typeof body.displayName === 'string' && body.displayName.trim()
                ? body.displayName.trim()
                : 'My Store'
        const contactEmail =
            typeof body.contactEmail === 'string' && body.contactEmail.trim()
                ? body.contactEmail.trim()
                : undefined

        const stripeClient = getStripeClient()

        // V2 API: Connected Account 作成
        // 指定されたプロパティのみ使用。type はトップレベルに含めない
        const account = await stripeClient.v2.core.accounts.create({
            display_name: displayName,
            ...(contactEmail && { contact_email: contactEmail }),
            identity: {
                country: 'jp', // デモ用。本番ではユーザー選択またはビジネス国に合わせる
            },
            dashboard: 'full',
            defaults: {
                responsibilities: {
                    fees_collector: 'stripe',
                    losses_collector: 'stripe',
                },
            },
            configuration: {
                customer: {},
                merchant: {
                    capabilities: {
                        card_payments: {
                            requested: true,
                        },
                    },
                },
            },
            // オンボーディング状態判定に必要
            include: ['configuration.merchant', 'requirements'],
        })

        const accountId = typeof account === 'object' && account && 'id' in account ? (account as { id: string }).id : null
        if (!accountId) {
            return NextResponse.json(
                { error: 'Failed to get account id from Stripe' },
                { status: 500 }
            )
        }

        return NextResponse.json({ accountId })
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
