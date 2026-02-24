import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/link";
import { TenantDetailEditForm } from "../../../_components/tenantDetailEditForm";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function TenantDetailEditPage({ params: paramsPromise }: PageProps) {
    const { orgId, tenantId } = await paramsPromise;

    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);

    if (!organization) {
        notFound();
    }

    return (
        <div className="mx-auto container flex flex-col gap-8 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">
                        {organization.name} - テナント詳細編集
                    </h1>
                    <div className="text-sm text-muted-foreground">
                        <p>Tenant ID: {tenantId}</p>
                    </div>
                </div>
                <Button asChild variant="outline">
                    <Link href={`/o/${orgId}/admin/tenant/${tenantId}`}>
                        戻る
                    </Link>
                </Button>
            </div>

            <TenantDetailEditForm
                orgId={orgId}
                tenantId={tenantId as any}
            />
        </div>
    );
}
