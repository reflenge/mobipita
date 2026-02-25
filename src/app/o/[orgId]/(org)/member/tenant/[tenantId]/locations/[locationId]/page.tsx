import { Link } from "@/components/link";
import { LocationDetail } from "../_components/LocationDetail";

type PageProps = {
    params: Promise<{
        orgId: string;
        tenantId: string;
        locationId: string;
    }>;
};

export default async function LocationDetailPage({ params }: PageProps) {
    const { orgId, tenantId, locationId } = await params;
    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div className="flex items-center gap-4">
                <Link
                    href={`/o/${orgId}/member/tenant/${tenantId}/locations`}
                    className="text-muted-foreground hover:text-foreground text-sm"
                >
                    ← 場所一覧
                </Link>
            </div>
            <LocationDetail
                orgId={orgId}
                tenantId={tenantId}
                locationId={locationId}
            />
        </div>
    );
}
