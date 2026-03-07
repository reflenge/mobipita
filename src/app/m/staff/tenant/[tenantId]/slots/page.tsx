import { SlotListCalendar } from "./_components/SlotListCalendar";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

type PageProps = {
    params: Promise<{ tenantId: string }>;
};

export default async function MemberTenantPage({ params }: PageProps) {
    const { tenantId } = await params;
    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">予約枠一覧</h1>
                <Link href={`/m/staff/tenant/${tenantId}/slots/create`}>
                    <Button>予約枠を作成</Button>
                </Link>
            </div>
            <SlotListCalendar tenantId={tenantId} />
        </div>
    );
}
