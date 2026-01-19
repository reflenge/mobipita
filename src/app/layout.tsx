import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import ConvexClientProvider from "./ConvexClientProvider";
import Header from "@/components/header";
import Messages from "@/components/samples/messages";
import { Toaster } from "@/components/ui/sonner";
// import { Analytics } from "@vercel/analytics/next";
// import { SpeedInsights } from "@vercel/speed-insights/next";
// import ClarityInit from "@/components/clarity-init";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MobiPita",
    description:
        "「Mobile（移動）」+「Pita（ピタッと決まる・合わせる）」。10分刻みの細かい予約枠に「時間をピタッと合わせられる」利便性と、移動店舗が指定の場所に「時間通りに来る」安心感を表現しました。",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider localization={jaJP}>
            <html lang="ja">
                <body
                    className={cn(
                        geistSans.variable,
                        geistMono.variable,
                        "antialiased",
                    )}
                >
                    <ConvexClientProvider>
                        <Header />
                        {children}
                        <Toaster richColors closeButton />
                        {/* <SpeedInsights />
                        <Analytics />
                        <ClarityInit /> */}
                        {/* <Messages /> */}
                    </ConvexClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
