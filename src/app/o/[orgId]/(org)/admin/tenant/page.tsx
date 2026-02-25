import { clerkClient } from "@clerk/nextjs/server";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TenantList from "./_components/tenantList";

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
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">
                        {organizationName} のテナント一覧
                    </h1>
                    <div className="text-muted-foreground text-sm">
                        <p>Org Slug: {organization?.slug ?? "不明"}</p>
                        <p>Org ID: {organizationId}</p>
                    </div>
                </div>
                <Button asChild size="lg">
                    <Link href={`/o/${organizationId}/admin/tenant/create`}>
                        テナントを作成
                    </Link>
                </Button>
            </div>
            <Separator />
            <TenantList orgId={organizationId} />
        </div>
    );
}
