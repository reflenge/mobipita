import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";
import { Link } from "@/components/link";

import AutoBreadcrumb from "./_components/breadcrumb";
import { cn } from "@/lib/utils";

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
    const { orgId: activeOrgId, orgRole, userId } = await auth();
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

    const outView = true;
    // const outView = false;

    // スコープが一致している場合のみ配下コンテンツを描画する。
    return (
        <SidebarProvider>
            <AppSidebar
                org={org}
                user={{ role: userRole, userId: userId ?? "" }}
            />
            <section className="flex min-h-dvh w-full flex-col">
                <h2 className="sr-only">Organization Content</h2>
                <header
                    className={cn(
                        outView && "outline-1 outline-red-300",
                        "m-2 p-2",
                    )}
                >
                    <SidebarTrigger />
                </header>
                <main
                    className={cn(
                        outView && "outline-1 outline-green-300",
                        "m-2 grow p-2",
                    )}
                >
                    <AutoBreadcrumb />
                    {children}
                </main>
                <footer
                    className={cn(
                        outView && "outline-1 outline-blue-300",
                        "m-2 p-2",
                    )}
                >
                    <section>
                        <p className="text-muted-foreground text-sm">
                            <Link href="/o">
                                このエリアは単一の組織にスコープされています。
                            </Link>
                        </p>
                    </section>
                    <section>
                        <p className="text-muted-foreground text-center text-xs">
                            mobipita © reflenge 2025
                        </p>
                    </section>
                </footer>
            </section>
        </SidebarProvider>
    );
}
