import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppSidebar } from "./_components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getRoleFromClaims } from "@/lib/roles";
import { SiteHeader } from "./_components/site-header"

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

    return (
        <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="flex flex-1">
                    <AppSidebar user={{ role, userId }} />
                    <SidebarInset>
                        <section className="flex min-h-[calc(100dvh-var(--header-height))] w-full flex-col">
                            <main className="m-2 grow">
                                {children}
                            </main>
                            <footer className="m-2 p-2">
                                <section>
                                    <p className="text-muted-foreground text-center text-xs">
                                        mobipita © reflenge 2025
                                    </p>
                                </section>
                            </footer>
                        </section>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}
