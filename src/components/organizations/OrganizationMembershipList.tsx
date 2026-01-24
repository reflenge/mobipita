"use client";

import { OrganizationList, useOrganizationList } from "@clerk/nextjs";

export default function OrganizationMembershipList() {
    const { isLoaded, userMemberships } = useOrganizationList({
        userMemberships: {
            pageSize: 1,
        },
    });

    if (!isLoaded || !userMemberships || userMemberships.isLoading) {
        return null;
    }

    if (userMemberships.count === 0) {
        return (
            <div className="flex items-center justify-center p-2">
                <p className="text-sm text-muted-foreground">
                    あなたは組織に所属していません。
                </p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-2">
            <OrganizationList
                afterSelectOrganizationUrl="/o/:id"
                hidePersonal={true}
            />
        </div>
    );
}
