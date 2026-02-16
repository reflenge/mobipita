import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberLocationsPage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <div className="mx-auto container px-6 py-10">
            <Link href={`/o/${orgId}/member/tenant/${tenantId}/locations/create`}>
                <Button>場所を作成</Button>
            </Link>
        </div >
    );
}
