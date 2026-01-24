import { clerkClient } from "@clerk/nextjs/server";

type OrganizationPageProps = {
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId } = await params;
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;
    const organizationName = organization?.name ?? "不明";

    return (
        <div>
            Tenant Create Page for {organizationName} ({organizationId})
        </div>
    );
}
