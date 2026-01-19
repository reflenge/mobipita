import { clerkClient } from "@clerk/nextjs/server";
import OrganizationAdminPanel from "./OrganizationAdminPanel";

type OrganizationPageProps = {
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationPage({ params }: OrganizationPageProps) {
    const { orgId } = await params;
    console.log("🚀 => OrganizationPage => orgId:", orgId)
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;
    const organizationName = organization?.name ?? "不明";

    return (
        <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col gap-4 px-6 py-10">
            {/* 現在の組織を表示（組織スコープの目印） */}
            <h1 className="text-2xl font-semibold">
                組織: {organizationName}
            </h1>
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
            <OrganizationAdminPanel />
        </main>
    );
}
