import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { ServiceList } from "./_components/ServiceList";

type PageProps = {
    params: Promise<{ tenantId: string }>;
};

export default async function MemberTenantServicesPage({ params }: PageProps) {
    const { tenantId } = await params;
    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">サービス一覧</h1>
                <Link href={`/staff/tenant/${tenantId}/services/create`}>
                    <Button>サービスを作成</Button>
                </Link>
            </div>
            <ServiceList tenantId={tenantId} />
        </div>
    );
}
