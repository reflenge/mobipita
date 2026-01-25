import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { Link } from "@/components/link";

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
    const { orgId: activeOrgId, orgRole } = await auth();
    const { orgId } = await params;

    // URL とアクティブ Org が食い違う場合は不正アクセス扱いで 404。
    if (activeOrgId !== orgId) {
        notFound();
    }

    // アクティブ Organization のロールを取得する。
    // orgRole は "org:admin" | "org:member" | "org:customer" など。
    const userRole = orgRole ?? "org:customer";

    // AppSidebar に渡す組織情報を取得する。
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: activeOrgId })
        .catch(() => null);
    const orgName = organization?.name ?? "不明";
    const org = {
        id: organization?.id ?? "",
        name: orgName,
        imageUrl: organization?.imageUrl ?? "",
    };

    // スコープが一致している場合のみ配下コンテンツを描画する。
    return (
        <SidebarProvider>
            <AppSidebar org={org} user={{ role: userRole }} />
            <section className="w-full flex flex-col min-h-dvh">
                <h2 className="sr-only">Organization Content</h2>
                <header className="bg-red-100 m-2 p-2">
                    <SidebarTrigger />
                </header>
                <main className="bg-green-100 grow m-2 p-2">{children}</main>
                <footer className="bg-blue-100 m-2 p-2">
                    <section>
                        <p className="text-sm text-muted-foreground">
                            <Link href="/o">
                                このエリアは単一の組織にスコープされています。
                            </Link>
                        </p>
                    </section>
                    <section>
                        <p className="text-xs text-muted-foreground text-center">
                            mobipita © reflenge 2025
                        </p>
                    </section>
                </footer>
            </section>
        </SidebarProvider>
    );
}
