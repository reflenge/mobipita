import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/sidebar";

import AutoBreadcrumb from "./_components/breadcrumb";
import { cn } from "@/lib/utils";
import { getRoleFromClaims } from "@/lib/roles";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const role = getRoleFromClaims(sessionClaims);

    const outView = true;

    return (
        <SidebarProvider>
            <AppSidebar user={{ role, userId }} />
            <section className="flex min-h-dvh w-full flex-col">
                <h2 className="sr-only">Main Content</h2>
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
                        <p className="text-muted-foreground text-center text-xs">
                            mobipita © reflenge 2025
                        </p>
                    </section>
                </footer>
            </section>
        </SidebarProvider>
    );
}
