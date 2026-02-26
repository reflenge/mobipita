import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TenantList from "./_components/tenantList";

export default async function TenantPage() {
    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">テナント一覧</h1>
                </div>
                <Button asChild size="lg">
                    <Link href="/company/tenant/create">テナントを作成</Link>
                </Button>
            </div>
            <Separator />
            <TenantList />
        </div>
    );
}
