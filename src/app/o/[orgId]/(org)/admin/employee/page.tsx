import { clerkClient } from "@clerk/nextjs/server";
import {
    EmployeeList,
    type EmployeeSummary,
} from "./_components/employee-list";

type PageProps = {
    params: Promise<{ orgId: string }>;
};

export default async function EmployeePage({ params }: PageProps) {
    const { orgId } = await params;
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;

    const memberships =
        await client.organizations.getOrganizationMembershipList({
            organizationId,
        });

    const employees: EmployeeSummary[] = (memberships.data ?? []).map((m) => {
        const pub = m.publicUserData;
        const firstName = pub?.firstName ?? "";
        const lastName = pub?.lastName ?? "";
        const displayName =
            `${firstName} ${lastName}`.trim() || (pub?.identifier ?? "不明");
        return {
            userId: pub?.userId ?? "",
            role: m.role,
            displayName,
            identifier: pub?.identifier ?? "不明",
            imageUrl: pub?.imageUrl ?? null,
            createdAt: m.createdAt,
        };
    });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <EmployeeList orgId={organizationId} employees={employees} />
        </div>
    );
}
