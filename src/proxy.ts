import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/**
 * LINE内ブラウザを判定し、必要に応じてリダイレクトを行う
 * @param req - Next.jsのリクエストオブジェクト
 * @returns リダイレクトが必要な場合は NextResponse、不要な場合は null
 */
function handleLineInAppBrowser(req: NextRequest): NextResponse | null {
    const userAgent = req.headers.get("user-agent") ?? "";
    const url = req.nextUrl;
    const hasExternalBrowserParam = url.searchParams.has("openExternalBrowser");

    // GET/HEADリクエストのみ処理
    if (req.method !== "GET" && req.method !== "HEAD") {
        return null;
    }

    // LINE内ブラウザの場合、外部ブラウザへ誘導
    if (userAgent.includes("Line/") && !hasExternalBrowserParam) {
        const redirectUrl = url.clone();
        redirectUrl.searchParams.set("openExternalBrowser", "1");
        return NextResponse.redirect(redirectUrl, 307);
    }

    // LINE内ブラウザでない場合、パラメータを削除
    if (!userAgent.includes("Line/") && hasExternalBrowserParam) {
        const redirectUrl = url.clone();
        redirectUrl.searchParams.delete("openExternalBrowser");
        return NextResponse.redirect(redirectUrl, 307);
    }

    return null;
}

export default clerkMiddleware(async (auth, req) => {
    // LINE内ブラウザ判定
    const lineRedirect = handleLineInAppBrowser(req);
    if (lineRedirect) {
        return lineRedirect;
    }

    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
