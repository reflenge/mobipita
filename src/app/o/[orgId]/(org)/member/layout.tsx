import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type MemberLayoutProps = {
    children: React.ReactNode;
    params: Promise<{
        orgId: string;
    }>;
};

export default async function MemberLayout({
    children,
    params,
}: MemberLayoutProps) {
    const { orgRole } = await auth();
    const { orgId } = await params;
    const userRole = orgRole ?? "org:customer";

    if (userRole !== "org:admin" && userRole !== "org:member") {
        redirect(`/o/${orgId}`);
    }

    return <>{children}</>;
}
