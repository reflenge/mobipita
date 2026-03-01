"use client";
import { Suspense } from "react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <Suspense
            fallback={
                <div className="text-muted-foreground container mx-auto px-6 py-10">
                    読み込み中…
                </div>
            }
        >
            <HomePageInner />
        </Suspense>
    );
}

function HomePageInner() {
    const [canceled, setCanceled] = useQueryState("canceled");

    if (canceled) {
        console.log(
            "Order canceled -- continue to shop around and checkout when you’re ready.",
        );
        toast.error(
            "Order canceled -- continue to shop around and checkout when you’re ready.",
        );
    }
    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <form action="/api/checkout_sessions" method="POST">
                <section>
                    <Button type="submit" role="link">
                        Checkout
                    </Button>
                </section>
            </form>
        </div>
    );
}
