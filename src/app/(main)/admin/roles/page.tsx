import { auth, clerkClient } from "@clerk/nextjs/server";
import { getRoleFromClaims, assignableRoles, type AppRole } from "@/lib/roles";
import { RoleManager } from "../../company/employee/upgrade/_components/RoleManager";
import type { UserForUpgrade } from "../../company/employee/upgrade/page";

export default async function AdminRolesPage() {
    const { userId, sessionClaims } = await auth();
    if (!userId) return null;

    const operatorRole = getRoleFromClaims(sessionClaims);
    const availableRoles = assignableRoles(operatorRole);

    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: 100 });

    const users: UserForUpgrade[] = usersResponse.data
        .filter((u) => u.id !== userId)
        .map((u) => {
            const role =
                ((u.publicMetadata as Record<string, unknown>)
                    ?.role as string) ?? "customer";
            const firstName = u.firstName ?? "";
            const lastName = u.lastName ?? "";
            const displayName =
                `${firstName} ${lastName}`.trim() ||
                (u.emailAddresses[0]?.emailAddress ?? "不明");
            return {
                userId: u.id,
                displayName,
                identifier: u.emailAddresses[0]?.emailAddress ?? "不明",
                imageUrl: u.imageUrl ?? null,
                currentRole: role as AppRole,
            };
        });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <RoleManager
                users={users}
                operatorRole={operatorRole}
                availableRoles={availableRoles}
            />
        </div>
    );
}
