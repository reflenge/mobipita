import { Link } from "@/components/link";
import { ServiceDetail } from "../_components/ServiceDetail";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string; serviceId: string }>;
};

export default async function ServiceDetailPage({ params }: PageProps) {
    const { orgId, tenantId, serviceId } = await params;
    return (
        <div className="mx-auto container px-6 py-10 space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/o/${orgId}/member/tenant/${tenantId}/services`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ← サービス一覧
                </Link>
            </div>
            <ServiceDetail
                orgId={orgId}
                tenantId={tenantId}
                serviceId={serviceId}
            />
        </div>
    );
}
