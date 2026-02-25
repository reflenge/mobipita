import { clerkClient } from "@clerk/nextjs/server";
import {
    StaffAssignment,
    type MemberSummary,
} from "../_components/staff-assignment";

type PageProps = {
    params: Promise<{ orgId: string }>;
};

export default async function AssignmentPage({ params }: PageProps) {
    const { orgId } = await params;
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;

    const memberships =
        await client.organizations.getOrganizationMembershipList({
            organizationId: organizationId,
            // limit: 100,
            role: ["org:admin", "org:member"],
        });
    const staffMembers: MemberSummary[] = (memberships.data ?? []).map((m) => {
        const pub = m.publicUserData;
        const firstName = pub?.firstName ?? "";
        const lastName = pub?.lastName ?? "";
        const displayName =
            `${firstName} ${lastName}`.trim() || (pub?.identifier ?? "不明");
        return {
            userId: m.publicUserData?.userId ?? "",
            role: m.role,
            displayName,
            identifier: pub?.identifier ?? "不明",
            imageUrl: pub?.imageUrl ?? null,
        };
    });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <StaffAssignment orgId={organizationId} members={staffMembers} />
        </div>
    );
}
