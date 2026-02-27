/**
 * 会社管理：ユーザー別テナント割当ページ
 * 指定ユーザーに割り当てるテナントを選択・保存する。PersonalAssignment を表示する。
 */
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PersonalAssignment } from "./_components/PersonalAssignment";

type Props = {
    params: Promise<{ userId: string }>;
};

export default async function PersonalAssignmentPage({ params }: Props) {
    const { userId } = await params;

    const client = await clerkClient();
    let clerkUser;
    try {
        clerkUser = await client.users.getUser(userId);
    } catch {
        notFound();
    }

    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";
    const displayName =
        `${lastName} ${firstName}`.trim() ||
        (clerkUser.emailAddresses[0]?.emailAddress ?? "不明");

    return (
        <div className="container mx-auto px-6 py-10">
            <PersonalAssignment
                userId={clerkUser.id}
                displayName={displayName}
                imageUrl={clerkUser.imageUrl ?? null}
            />
        </div>
    );
}
