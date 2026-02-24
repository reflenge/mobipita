import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { OrgLayout } from "./_components/OrgLayout";

type OrganizationLayoutProps = {
    children: React.ReactNode;
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationLayout({
    children,
    params,
}: OrganizationLayoutProps) {
    const { orgId: activeOrgId, orgRole, userId } = await auth();
    const { orgId } = await params;

    // URL とアクティブ Org が食い違う場合は不正アクセス扱いで 404。
    if (activeOrgId !== orgId) {
        notFound();
    }

    // アクティブ Organization のロールを取得する。
    // orgRole は "org:admin" | "org:member" | "org:customer" など。
    const userRole = orgRole ?? "org:customer";

    // AppSidebar に渡す組織情報を取得する。
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: activeOrgId })
        .catch(() => null);
    const orgName = organization?.name ?? "不明";
    const org = {
        id: organization?.id ?? "",
        name: orgName,
        imageUrl: organization?.imageUrl ?? "",
    };

    const outView = true;
    // const outView = false;

    // スコープが一致している場合のみ配下コンテンツを描画する。
    return (
        <OrgLayout
            org={org}
            userRole={userRole}
            userId={userId ?? ""}
            outView={outView}
        >
            {children}
        </OrgLayout>
    );
}
