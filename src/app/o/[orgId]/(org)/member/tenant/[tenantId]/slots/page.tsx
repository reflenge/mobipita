import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";

type PageProps = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function MemberTenantPage({ params }: PageProps) {
    const { orgId, tenantId } = await params;
    return (
        <div className="mx-auto container px-6 py-10">
            <Link href={`/o/${orgId}/member/tenant/${tenantId}/slots/create`}>
                <Button>予約枠を作成</Button>
            </Link>
        </div >
    );
}
