/**
 * 会社管理：ユーザー一覧ページ
 * 自社ユーザーの一覧表示・ロール変更・テナント割当・詳細への導線を提供する。
 */
import { auth, clerkClient } from "@clerk/nextjs/server";
import { assignableRoles } from "@/lib/roles";
import { UserList, type UserSummary } from "./_components/UserList";

export default async function CompanyUsersPage() {
    const { userId } = await auth();
    if (!userId) return null;

    // 会社ロールが割り当て可能なロール一覧（自社ユーザーに付与できるもの）
    const roles = assignableRoles("company");

    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({ limit: 100 });

    // 管理者以外の全ユーザーを取得し、表示用の UserSummary に変換
    const users: UserSummary[] = usersResponse.data
        .filter((u) => {
            const role =
                ((u.publicMetadata as Record<string, unknown>)?.role as string) ??
                "customer";
            return role !== "admin";
        })
        .map((u) => {
            const role =
                ((u.publicMetadata as Record<string, unknown>)?.role as string) ??
                "customer";
            const firstName = u.firstName ?? "";
            const lastName = u.lastName ?? "";
            const displayName =
                `${firstName} ${lastName}`.trim() ||
                (u.emailAddresses[0]?.emailAddress ?? "不明");
            return {
                userId: u.id,
                role,
                displayName,
                identifier: u.emailAddresses[0]?.emailAddress ?? "不明",
                imageUrl: u.imageUrl,
                createdAt: u.createdAt,
            };
        });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <UserList
                users={users}
                availableRoles={roles}
                currentUserId={userId}
                basePath="/company/users"
            />
        </div>
    );
}
