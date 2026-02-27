import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { CustomerDetail } from "./_components/CustomerDetail";
import type { ProfileMeta } from "@/lib/profile";
import { getRoleFromClaims, assignableRoles } from "@/lib/roles";

type Props = {
    params: Promise<{ userId: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
    const { userId: currentUserId, sessionClaims } = await auth();
    if (!currentUserId) return null;

    const operatorRole = getRoleFromClaims(sessionClaims);
    const roles = assignableRoles("company");

    const { userId } = await params;

    const client = await clerkClient();
    let clerkUser;
    try {
        clerkUser = await client.users.getUser(userId);
    } catch {
        notFound();
    }

    const meta = (clerkUser.unsafeMetadata ?? {}) as ProfileMeta;
    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";
    const displayName =
        `${lastName} ${firstName}`.trim() ||
        (clerkUser.emailAddresses[0]?.emailAddress ?? "不明");

    const userRole =
        ((clerkUser.publicMetadata as Record<string, unknown>)?.role as string) ??
        "customer";

    const userInfo = {
        userId: clerkUser.id,
        displayName,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser.imageUrl ?? "",
        firstName,
        lastName,
        gender: meta.gender,
        birthday: meta.birthday,
        phone: meta.phone,
        address: meta.address,
        role: userRole,
    };

    return (
        <div className="container mx-auto px-6 py-10">
            <CustomerDetail
                user={userInfo}
                availableRoles={roles}
                currentUserId={currentUserId}
            />
        </div>
    );
}
