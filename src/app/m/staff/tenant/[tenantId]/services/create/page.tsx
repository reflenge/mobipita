import { CreateService } from "./createService";

type PageProps = {
    params: Promise<{ tenantId: string }>;
};

export default async function MemberSlotCreatePage({ params }: PageProps) {
    const { tenantId } = await params;
    return <CreateService tenantId={tenantId} />;
}
