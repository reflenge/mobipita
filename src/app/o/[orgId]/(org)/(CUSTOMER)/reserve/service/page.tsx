import { ServiceSearchPage } from "./_components/ServiceSearchPage";

type Props = { params: Promise<{ orgId: string }> };

export default async function Page({ params }: Props) {
    const { orgId } = await params;
    return <ServiceSearchPage orgId={orgId} />;
}
