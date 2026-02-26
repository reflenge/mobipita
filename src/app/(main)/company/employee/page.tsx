import { clerkClient } from "@clerk/nextjs/server";
import {
    EmployeeList,
    type EmployeeSummary,
} from "./_components/employee-list";

export default async function EmployeePage() {
    const client = await clerkClient();

    const usersResponse = await client.users.getUserList({ limit: 100 });

    const employees: EmployeeSummary[] = usersResponse.data.map((u) => {
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
            imageUrl: u.imageUrl ?? null,
            createdAt: u.createdAt,
        };
    });

    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <EmployeeList employees={employees} />
        </div>
    );
}
