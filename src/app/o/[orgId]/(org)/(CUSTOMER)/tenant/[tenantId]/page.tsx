import { TenantSlots } from "./_components/TenantSlots";

type Props = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function TenantDetailPage({ params }: Props) {
    const { orgId, tenantId } = await params;
    return <TenantSlots orgId={orgId} tenantId={tenantId} />;
}
