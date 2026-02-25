import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { ServiceList } from "./_components/ServiceList";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberTenantServicesPage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <div className="mx-auto container px-6 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">サービス一覧</h1>
                <Link
                    href={`/o/${orgId}/member/tenant/${tenantId}/services/create`}
                >
                    <Button>サービスを作成</Button>
                </Link>
            </div>
            <ServiceList orgId={orgId} tenantId={tenantId} />
        </div>
    );
}
