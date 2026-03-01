/**
 * Stripe Connect: 商品作成
 *
 * Stripe-Account ヘッダーで Connected Account 上に商品を作成します。
 * POST body: { accountId, name, description?, priceInCents, currency? }
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe-connect";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const body = await req.json().catch(() => ({}));
        const accountId =
            typeof body.accountId === "string" ? body.accountId.trim() : null;
        const name = typeof body.name === "string" ? body.name.trim() : null;
        const description =
            typeof body.description === "string"
                ? body.description.trim()
                : undefined;
        const priceInCents =
            typeof body.priceInCents === "number" && body.priceInCents >= 0
                ? Math.round(body.priceInCents)
                : null;
        const currency =
            typeof body.currency === "string" && body.currency.length === 3
                ? body.currency.toLowerCase()
                : "jpy";

        if (!accountId || !accountId.startsWith("acct_")) {
            return NextResponse.json(
                { error: "Valid accountId (acct_xxx) is required" },
                { status: 400 },
            );
        }
        if (!name) {
            return NextResponse.json(
                { error: "name is required" },
                { status: 400 },
            );
        }
        if (priceInCents === null) {
            return NextResponse.json(
                { error: "priceInCents (number >= 0) is required" },
                { status: 400 },
            );
        }

        const stripeClient = getStripeClient();

        const product = await stripeClient.products.create(
            {
                name,
                description: description ?? undefined,
                default_price_data: {
                    unit_amount: priceInCents,
                    currency,
                },
            },
            { stripeAccount: accountId },
        );

        return NextResponse.json({
            productId: product.id,
            defaultPriceId:
                typeof product.default_price === "object" &&
                product.default_price &&
                "id" in product.default_price
                    ? (product.default_price as { id: string }).id
                    : product.default_price,
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
