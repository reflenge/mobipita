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
    const org = {
        id: organization?.id ?? orgId,
        name: organization?.name ?? "不明",
    };

    return <CreateTenantForm org={org} />;
}
