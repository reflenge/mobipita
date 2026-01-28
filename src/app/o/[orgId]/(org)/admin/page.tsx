import { OrganizationProfile, OrganizationSwitcher } from "@clerk/nextjs";
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
        <div className="mx-auto container px-6 py-10">
            <div>admin top page</div>
            <section>
                <div>組織の管理は このボタンから</div>
                <OrganizationSwitcher defaultOpen={true} hidePersonal={true} />
            </section>
        </div>
    );
}
