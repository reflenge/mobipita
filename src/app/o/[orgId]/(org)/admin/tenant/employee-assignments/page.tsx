import { redirect } from "next/navigation";

type PageProps = {
    params: Promise<{ orgId: string }>;
};

/** /employee-assignments は「従業員へ昇格」へリダイレクト */
export default async function EmployeeAssignmentsPage({ params }: PageProps) {
    const { orgId } = await params;
    redirect(`/o/${orgId}/admin/tenant/employee-assignments/upgrade`);
}
