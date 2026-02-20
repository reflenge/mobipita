import { StoreSearch } from "./_components/StoreSearch";

type SearchPageProps = {
    params: Promise<{ orgId: string }>;
};

export default async function SearchPage({ params }: SearchPageProps) {
    const { orgId } = await params;
    return <StoreSearch orgId={orgId} />;
}
