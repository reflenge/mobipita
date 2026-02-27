import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { PersonalAssignment } from "../../../../company/users/[userId]/assignment/_components/PersonalAssignment";

type Props = {
    params: Promise<{ userId: string }>;
};

export default async function AdminUserAssignmentPage({ params }: Props) {
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
