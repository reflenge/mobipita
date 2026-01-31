import { MemberTenantContent } from "./_components/MemberTenantContent";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberTenantPage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <MemberTenantContent orgId={orgId} tenantId={tenantId} />
    );
}
