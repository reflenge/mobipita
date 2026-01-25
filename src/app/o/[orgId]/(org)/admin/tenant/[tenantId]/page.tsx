import { clerkClient } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/link";
import { Separator } from "@/components/ui/separator";
import TenantDetail from "../_components/tenantDetail";

type OrganizationPageProps = {
    params: Promise<{
        orgId: string;
        tenantId: string;
    }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId, tenantId } = await params;
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;
    const organizationName = organization?.name ?? "不明";

    return (
        <div className="mx-auto container flex flex-col gap-8 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">
                        {organizationName} のテナント詳細
                    </h1>
                    <div className="text-sm text-muted-foreground">
                        <p>Org ID: {organizationId}</p>
                        <p>Tenant ID: {tenantId}</p>
                    </div>
                </div>
                <Button asChild variant="outline">
                    <Link href={`/o/${organizationId}/admin/tenant`}>
                        一覧へ戻る
                    </Link>
                </Button>
            </div>
            <Separator />
            <TenantDetail orgId={organizationId} tenantId={tenantId} />
        </div>
    );
}
