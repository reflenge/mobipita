import { CreateService } from "./createService";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberSlotCreatePage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <CreateService orgId={orgId} tenantId={tenantId} />
    );
}
