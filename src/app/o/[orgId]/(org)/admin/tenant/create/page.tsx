import { clerkClient } from "@clerk/nextjs/server";
import CreateTenantForm from "../_components/createTenantForm";

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
    const org = {
        id: organizationId,
        name: organizationName,
    };

    return <CreateTenantForm org={org} />;
}
