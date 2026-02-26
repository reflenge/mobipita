import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getRoleFromClaims, hasMinRole } from "@/lib/roles";
import { AdminWarningBanner } from "./_components/admin-warning-banner";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { sessionClaims } = await auth();
    const role = getRoleFromClaims(sessionClaims);

    if (!hasMinRole(role, "admin")) {
        redirect("/home");
    }

    return (
        <>
            {children}
            <AdminWarningBanner />
        </>
    );
}
