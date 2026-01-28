import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type AdminLayoutProps = {
    children: React.ReactNode;
    params: Promise<{
        orgId: string;
    }>;
};

export default async function AdminLayout({
    children,
    params,
}: AdminLayoutProps) {
    const { orgRole } = await auth();
    const { orgId } = await params;
    const userRole = orgRole ?? "org:customer";

    if (userRole !== "org:admin") {
        redirect(`/o/${orgId}`);
    }

    return <>{children}</>;
}
