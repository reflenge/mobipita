import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import ActivateOrganizationAndRedirect from "./ActivateOrganizationAndRedirect";

type JoinPageProps = {
    params: Promise<{
        orgId: string;
    }>;
};

// 参加直後に付与するロール。Clerk ダッシュボード側で作成済みである前提。
const DEFAULT_ROLE = "org:customer";

export default async function JoinPage({ params }: JoinPageProps) {
    // URL の orgId から参加対象の Organization を決める。
    const { orgId } = await params;
    console.log("?? => JoinPage => orgId:", orgId)
    // サーバー側で認証情報を取得し、未ログインならサインインへ誘導する。
    const { userId, redirectToSignIn } = await auth();

    if (!userId) {
        // サインイン後に同じ参加 URL へ戻す。
        return redirectToSignIn({ returnBackUrl: `/o/${orgId}/join` });
    }

    // Clerk のバックエンド API クライアントを取得する（Secret Key が必要）。
    const client = await clerkClient();
    // orgId から Organization を取得し、存在しなければ 404 にする。
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => notFound());
    console.log("?? => JoinPage => organization:", organization)

    // すでに参加済みかどうかを、ユーザー ID で絞って確認する。
    const membership = await client.organizations.getOrganizationMembershipList(
        {
            organizationId: organization.id,
            userId: [userId],
            limit: 1,
        }
    );

    if (membership.totalCount === 0) {
        // 未参加の場合のみ、招待を挟まずに membership を作成する。
        await client.organizations.createOrganizationMembership({
            organizationId: organization.id,
            userId,
            role: DEFAULT_ROLE,
        });
    }

    redirect(`/o/${organization.id}`);

    // return (
    //     <ActivateOrganizationAndRedirect
    //         organizationId={organization.id}
    //         redirectTo={`/o/${organization.id}`}
    //     />
    // );
}
