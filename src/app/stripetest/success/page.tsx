import { redirect } from "next/navigation";
import { createLoader, parseAsString } from "nuqs/server";
import { stripe } from "@/lib/stripe";

const loadSearchParams = createLoader({ session_id: parseAsString });

export default async function SuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id?: string }>;
}) {
    const { session_id } = await loadSearchParams(searchParams);

    if (!session_id)
        throw new Error("Please provide a valid session_id (`cs_test_...`)");

    const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items", "payment_intent"],
    });
    const status = session.status;
    const customerEmail = session.customer_details?.email;

    if (status === "open") {
        return redirect("/home");
    }

    if (status === "complete") {
        return (
            <section id="success">
                <p>
                    ご利用いただきありがとうございます！確認メールが
                    {customerEmail ?? "あなたのメールアドレス"}
                    に送信されます。ご不明な点がございましたら、メールにてお問い合わせください。
                </p>
                <a href="mailto:orders@example.com">orders@example.com</a>.
            </section>
        );
    }
}
