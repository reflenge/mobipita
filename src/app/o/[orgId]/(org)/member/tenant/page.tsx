import { MemberTenantListPage } from "./_components/MemberTenantListPage";

type PageProps = {
    params: Promise<{ orgId: string }>;
};

export default async function MemberTenantPage({ params }: PageProps) {
    const { orgId } = await params;
    return <MemberTenantListPage orgId={orgId} />;
}
