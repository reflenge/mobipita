import { Link } from "@/components/link";
import { ServiceDetail } from "../_components/ServiceDetail";

type PageProps = {
    params: Promise<{ tenantId: string; serviceId: string }>;
};

export default async function ServiceDetailPage({ params }: PageProps) {
    const { tenantId, serviceId } = await params;
    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div className="flex items-center gap-4">
                <Link
                    href={`/staff/tenant/${tenantId}/services`}
                    className="text-muted-foreground hover:text-foreground text-sm"
                >
                    ← サービス一覧
                </Link>
            </div>
            <ServiceDetail
                tenantId={tenantId}
                serviceId={serviceId}
            />
        </div>
    );
}
