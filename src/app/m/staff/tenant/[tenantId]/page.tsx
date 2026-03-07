import { MemberTenantContent } from "./_components/MemberTenantContent";

type PageProps = {
    params: Promise<{ tenantId: string }>;
};

export default async function MemberTenantPage({ params }: PageProps) {
    const { tenantId } = await params;
    return <MemberTenantContent tenantId={tenantId} />;
}
