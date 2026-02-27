/**
 * 会社管理：ユーザー詳細（顧客詳細）ページ
 * 指定 userId の顧客プロフィール・スタッフメモ・タグを表示・編集する。
 */
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { CustomerDetail } from "./_components/CustomerDetail";
import type { ProfileMeta } from "@/lib/profile";

type Props = {
    params: Promise<{ userId: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
    const { userId } = await params;

    const client = await clerkClient();
    let clerkUser;
    try {
        clerkUser = await client.users.getUser(userId);
    } catch {
        notFound();
    }

    // プロフィール拡張情報（性別・生年月日・電話・住所など）は unsafeMetadata に格納
    const meta = (clerkUser.unsafeMetadata ?? {}) as ProfileMeta;
    const firstName = clerkUser.firstName ?? "";
    const lastName = clerkUser.lastName ?? "";
    const displayName =
        `${lastName} ${firstName}`.trim() ||
        (clerkUser.emailAddresses[0]?.emailAddress ?? "不明");

    const userInfo = {
        userId: clerkUser.id,
        displayName,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: clerkUser.imageUrl ?? null,
        firstName,
        lastName,
        gender: meta.gender,
        birthday: meta.birthday,
        phone: meta.phone,
        address: meta.address,
    };

    return (
        <div className="container mx-auto px-6 py-10">
            <CustomerDetail user={userInfo} />
        </div>
    );
}
