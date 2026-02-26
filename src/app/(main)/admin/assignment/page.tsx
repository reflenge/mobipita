import { clerkClient } from "@clerk/nextjs/server";
import {
    StaffAssignment,
    type MemberSummary,
} from "../../company/employee/_components/staff-assignment";

export default async function AdminAssignmentPage() {
    const client = await clerkClient();

    const usersResponse = await client.users.getUserList({ limit: 100 });

    const staffMembers: MemberSummary[] = usersResponse.data
        .filter((u) => {
            const role =
                ((u.publicMetadata as Record<string, unknown>)
                    ?.role as string) ?? "customer";
            return (
                role === "admin" ||
                role === "company" ||
                role === "staff"
            );
        })
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
                role,
                displayName,
                identifier: u.emailAddresses[0]?.emailAddress ?? "不明",
                imageUrl: u.imageUrl ?? null,
            };
        });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <StaffAssignment members={staffMembers} />
        </div>
    );
}
