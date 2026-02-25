import { DateSearchPage } from "./_components/DateSearchPage";

type Props = { params: Promise<{ orgId: string }> };

export default async function Page({ params }: Props) {
    const { orgId } = await params;
    return <DateSearchPage orgId={orgId} />;
}
