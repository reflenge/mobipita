import { clerkClient } from "@clerk/nextjs/server";
import { Link } from "@/components/link";

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
        <div className="mx-auto container px-6 py-10">
            {/* 現在の組織を表示（組織スコープの目印） */}
            <h1 className="text-2xl font-semibold">組織: {organizationName}</h1>
            <p className="text-sm text-muted-foreground">
                Org Slug: {organization?.slug ?? "不明"}
            </p>
            <p className="text-sm text-muted-foreground">
                Org ID: {organizationId}
            </p>
            {/* この配下が「組織単位」で固定されることを示すガイド文 */}
            <p className="text-sm text-muted-foreground">
                このエリアは単一の組織にスコープされています。
            </p>

            <Link href={`/o/${organizationId}/admin/tenant/create`}>
                テナント作成ページへ移動
            </Link>
            <Link href={`/o/${organizationId}/admin/tenant/testid`}>
                テナント詳細ページへ移動
            </Link>
        </div>
    );
}
