import { CreateSlot } from "./createSlot";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberSlotCreatePage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return <CreateSlot orgId={orgId} tenantId={tenantId} />;
}
