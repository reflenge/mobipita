import { currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
    try {
        const headersList = await headers();
        const origin = headersList.get("origin");

        const data = await currentUser();
        const userEmail = data?.emailAddresses[0]?.emailAddress ?? "";

        // bodyパラメータからCheckout Sessionを作成する
        const session = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            line_items: [
                {
                    // 販売したい商品の正確なPrice ID（例: price_1234）を指定してください
                    price: "price_1T5h1VEK998hpRE2tdNXsGpi",
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/stripetest/success?session_id={CHECKOUT_SESSION_ID}`,
        });
        return NextResponse.redirect(session.url!, 303);
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
