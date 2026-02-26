import { Button } from "@/components/ui/button";
import { Link } from "@/components/link";
import { Separator } from "@/components/ui/separator";
import TenantDetail from "../_components/tenantDetail";

type PageProps = {
    params: Promise<{
        tenantId: string;
    }>;
};

export default async function TenantDetailPage({ params }: PageProps) {
    const { tenantId } = await params;

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">テナント詳細</h1>
                    <div className="text-muted-foreground text-sm">
                        <p>Tenant ID: {tenantId}</p>
                    </div>
                </div>
                <Button asChild variant="outline">
                    <Link href="/admin/tenant">一覧へ戻る</Link>
                </Button>
            </div>
            <Separator />
            <TenantDetail tenantId={tenantId} />
        </div>
    );
}
