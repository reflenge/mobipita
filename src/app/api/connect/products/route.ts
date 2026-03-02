/**
 * Stripe Connect: 商品一覧取得
 *
 * Stripe-Account ヘッダーで Connected Account に紐づいた商品を取得します。
 * GET ?accountId=acct_xxx
 */

import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe-connect";

export async function GET(req: Request) {
    try {
        // ストアフロント用: 未認証でも商品一覧は取得可能

        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get("accountId");
        if (!accountId || !accountId.startsWith("acct_")) {
            return NextResponse.json(
                { error: "Valid accountId (acct_xxx) is required" },
                { status: 400 },
            );
        }

        const stripeClient = getStripeClient();

        // Connected Account の商品を取得（Stripe-Account = stripeAccount オプション）
        const list = await stripeClient.products.list(
            {
                limit: 20,
                active: true,
                expand: ["data.default_price"],
            },
            { stripeAccount: accountId },
        );

        return NextResponse.json({
            products: list.data,
            hasMore: list.has_more,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const statusCode =
            err &&
            typeof err === "object" &&
            "statusCode" in err &&
            typeof (err as { statusCode?: number }).statusCode === "number"
                ? (err as { statusCode: number }).statusCode
                : 500;
        return NextResponse.json({ error: message }, { status: statusCode });
    }
}
