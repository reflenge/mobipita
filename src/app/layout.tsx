import { jaJP } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { Metadata } from "next";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
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
                        <NuqsAdapter>
                            <TooltipProvider>
                                <Toaster richColors closeButton />
                                {children}
                            </TooltipProvider>
                        </NuqsAdapter>
                        {/* <SpeedInsights />
                        <Analytics />
                        <ClarityInit /> */}
                    </ConvexClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
