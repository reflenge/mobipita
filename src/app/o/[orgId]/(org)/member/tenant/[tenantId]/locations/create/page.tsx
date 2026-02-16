import { CreateLocation } from "./createLocation";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberLocationCreatePage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <CreateLocation orgId={orgId} tenantId={tenantId} />
    );
}
