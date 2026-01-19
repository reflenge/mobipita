import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

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
    // clerkMiddleware の organizationSyncOptions により、
    // URL の :id がアクティブ Org と同期される前提。
    const { orgId: activeOrgId } = await auth();
    console.log("🚀 => OrganizationLayout => activeOrgId:", activeOrgId);
    const { orgId } = await params;
    console.log("🚀 => OrganizationLayout => orgId:", orgId);

    // URL とアクティブ Org が食い違う場合は不正アクセス扱いで 404。
    if (activeOrgId !== orgId) {
        notFound();
    }

    // スコープが一致している場合のみ配下コンテンツを描画する。
    return <>{children}</>;
}
