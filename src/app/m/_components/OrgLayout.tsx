"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { Link } from "@/components/link";
import AutoBreadcrumb from "./breadcrumb";
import { cn } from "@/lib/utils";

type OrgLayoutProps = {
    children: React.ReactNode;
    org: {
        id: string;
        name: string;
        imageUrl: string;
    };
    userRole: string;
    userId: string;
    outView?: boolean;
};

export function OrgLayout({
    children,
    org,
    userRole,
    userId,
    outView = true,
}: OrgLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar
                org={org}
                user={{ role: userRole, userId: userId }}
            />
            <section className="w-full flex flex-col min-h-dvh">
                <h2 className="sr-only">Organization Content</h2>
                <header className={cn(outView && "outline-1 outline-red-300", "m-2 p-2")}>
                    <SidebarTrigger />
                </header>
                <main className={cn(outView && "outline-1 outline-green-300", "grow m-2 p-2")}>
                    <AutoBreadcrumb />
                    {children}
                </main>
                <footer className={cn(outView && "outline-1 outline-blue-300", "m-2 p-2")}>
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
