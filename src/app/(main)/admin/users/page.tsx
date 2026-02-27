import { auth, clerkClient } from "@clerk/nextjs/server";
import {
    UserList,
    type UserSummary,
} from "../../company/users/_components/UserList";
import { getRoleFromClaims, assignableRoles } from "@/lib/roles";

export default async function AdminUsersPage() {
    const { userId, sessionClaims } = await auth();
    if (!userId) return null;

    const operatorRole = getRoleFromClaims(sessionClaims);
    const roles = assignableRoles(operatorRole);

    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: 100 });

    const users: UserSummary[] = usersResponse.data.map((u) => {
        const role =
            ((u.publicMetadata as Record<string, unknown>)?.role as string) ??
            "customer";
        const firstName = u.firstName ?? "";
        const lastName = u.lastName ?? "";
        const displayName =
            `${lastName} ${firstName}`.trim() ||
            (u.emailAddresses[0]?.emailAddress ?? "不明");
        return {
            userId: u.id,
            role,
            displayName,
            identifier: u.emailAddresses[0]?.emailAddress ?? "不明",
            imageUrl: u.imageUrl ?? "",
            createdAt: u.createdAt,
        };
    });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <UserList
                users={users}
                availableRoles={roles}
                currentUserId={userId}
                basePath="/admin/users"
            />
        </div>
    );
}
