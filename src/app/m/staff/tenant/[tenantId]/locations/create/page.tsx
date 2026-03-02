import { CreateLocation } from "./createLocation";

type PageProps = {
    params: Promise<{ tenantId: string }>;
};

export default async function MemberLocationCreatePage({ params }: PageProps) {
    const { tenantId } = await params;
    return <CreateLocation tenantId={tenantId} />;
}
