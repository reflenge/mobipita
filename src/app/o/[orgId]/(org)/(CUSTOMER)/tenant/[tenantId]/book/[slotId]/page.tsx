import { BookingForm } from "./_components/BookingForm";

type Props = {
    params: Promise<{ orgId: string; tenantId: string; slotId: string }>;
};

export default async function BookSlotPage({ params }: Props) {
    const { orgId, tenantId, slotId } = await params;
    return <BookingForm orgId={orgId} tenantId={tenantId} slotId={slotId} />;
}
