import { OrganizationList } from "@clerk/nextjs";

export default function OrganizationMembershipList() {
    return (
        <div className="flex items-center justify-center">
            <OrganizationList
                afterSelectOrganizationUrl="/o/:id"
                hidePersonal={true}
            />
        </div>
    );
}
