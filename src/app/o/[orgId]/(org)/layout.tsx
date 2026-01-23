import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

type OrganizationLayoutProps = {
    children: React.ReactNode;
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationLayout({
    children,
    params,
}: OrganizationLayoutProps) {
    // clerkMiddleware の organizationSyncOptions により、
    // URL の :id がアクティブ Org と同期される前提。
    const { orgId: activeOrgId } = await auth();
    console.log("🚀 => OrganizationLayout => activeOrgId:", activeOrgId);
    const { orgId } = await params;
    console.log("🚀 => OrganizationLayout => orgId:", orgId);

    // URL とアクティブ Org が食い違う場合は不正アクセス扱いで 404。
    if (activeOrgId !== orgId) {
        console.log("test------------*************");
        notFound();
    }

    // スコープが一致している場合のみ配下コンテンツを描画する。
    return (
        <SidebarProvider>
            <AppSidebar />
            <section className="w-full flex flex-col min-h-dvh">
                <h2 className="sr-only">Organization Content</h2>
                <header className="bg-red-400">
                    <SidebarTrigger />
                </header>
                <main className="bg-green-400 grow">{children}</main>
                <footer className="bg-blue-400">
                    <section>
                        <p className="text-sm text-muted-foreground">
                            このエリアは単一の組織にスコープされています。
                        </p>
                    </section>
                    <section>
                        <p className="text-xs text-muted-foreground text-center py-1">
                            mobipita © reflenge 2025
                        </p>
                    </section>
                </footer>
            </section>
        </SidebarProvider>
    );
}
