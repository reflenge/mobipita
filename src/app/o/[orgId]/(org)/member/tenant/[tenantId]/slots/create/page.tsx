import { MemberSlotCreateContent } from "./_components/MemberSlotCreateContent";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberSlotCreatePage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <MemberSlotCreateContent orgId={orgId} tenantId={tenantId} />
    );
}
