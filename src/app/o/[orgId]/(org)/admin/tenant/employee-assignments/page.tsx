import { clerkClient } from "@clerk/nextjs/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffUpgrade } from "./_components/staff-upgrade";
import { StaffAssignment } from "./_components/staff-assignment";

type OrganizationPageProps = {
    params: Promise<{
        orgId: string;
    }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId } = await params;
    const client = await clerkClient();
    const organization = await client.organizations
        .getOrganization({ organizationId: orgId })
        .catch(() => null);
    const organizationId = organization?.id ?? orgId;
    const organizationName = organization?.name ?? "不明";

    return (
        <div className="mx-auto container flex flex-col gap-8 px-6 py-10">
            <Tabs defaultValue="upgrade">
                <TabsList variant="line" className="w-3/4 mx-auto mb-6">
                    <TabsTrigger value="upgrade">
                        1. 従業員へ昇格する
                    </TabsTrigger>
                    <TabsTrigger value="assignment">
                        2. 各テナントへ振り分け
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="upgrade">
                    <StaffUpgrade />
                </TabsContent>
                <TabsContent value="assignment">
                    <StaffAssignment />
                </TabsContent>
            </Tabs>
        </div>
    );
}
