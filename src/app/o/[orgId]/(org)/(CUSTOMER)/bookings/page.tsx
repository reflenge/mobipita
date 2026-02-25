import { MyBookingsList } from "./_components/MyBookingsList";

type Props = {
    params: Promise<{ orgId: string }>;
};

export default async function MyBookingsPage({ params }: Props) {
    const { orgId } = await params;
    return <MyBookingsList orgId={orgId} />;
}
