import { CreateSlot } from "./createSlot";

type PageProps = {
    params: Promise<{ tenantId: string }>;
};

export default async function MemberSlotCreatePage({ params }: PageProps) {
    const { tenantId } = await params;
    return <CreateSlot tenantId={tenantId} />;
}
