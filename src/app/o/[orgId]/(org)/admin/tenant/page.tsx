import { clerkClient } from "@clerk/nextjs/server";
import OrganizationAdminPanel from "@/components/organizations/OrganizationAdminPanel";
import { OrganizationList } from "@clerk/nextjs";

type OrganizationPageProps = {
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId } = await params;
    console.log("🚀 => OrganizationPage => orgId:", orgId);
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;
    const organizationName = organization?.name ?? "不明";

    return <section className="px-2 py-4">test</section>;
}
