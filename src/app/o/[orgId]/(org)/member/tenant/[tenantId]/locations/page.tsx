import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { LocationList } from "./_components/LocationList";
import { LocationsMap } from "./_components/LocationsMap";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberLocationsPage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <div className="mx-auto container px-6 py-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">場所一覧</h1>
                <Link
                    href={`/o/${orgId}/member/tenant/${tenantId}/locations/create`}
                >
                    <Button>場所を作成</Button>
                </Link>
            </div>
            <LocationList orgId={orgId} tenantId={tenantId} />
            <LocationsMap tenantId={tenantId} />
        </div>
    );
}
