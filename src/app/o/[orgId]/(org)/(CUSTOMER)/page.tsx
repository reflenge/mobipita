import { BookingSearch } from "./_components/BookingSearch";

type OrganizationPageProps = {
    params: Promise<{ orgId: string }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId } = await params;
    return <BookingSearch orgId={orgId} />;
}
