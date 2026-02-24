import { Button } from "@/components/ui/button";
import { clerkClient } from "@clerk/nextjs/server";
import { Link } from "@/components/link";
import TenantList from "../_components/tenantList";

type OrganizationPageProps = {
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId } = await params;
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;
    const organizationName = organization?.name ?? "不明";

    return (
        <div className="mx-auto container flex flex-col gap-6 px-6 py-10">
            {/* ヘッダーセクション */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        テナント一覧
                    </h1>
                    <p className="text-sm md:text-base text-gray-600">
                        組織内のすべてのテナントと直営店舗を管理します。
                    </p>
                </div>
                <Button asChild size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                    <Link href={`/o/${organizationId}/admin/tenant/create`}>
                        ＋ 新規作成
                    </Link>
                </Button>
            </div>

            {/* テナント一覧 */}
            <TenantList orgId={organizationId} />
        </div>
    );
}
