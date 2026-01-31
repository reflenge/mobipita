import { Link } from "@/components/link";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserStar } from "lucide-react";
import { MemberTenantList } from "./MemberTenantList";

type MemberSidebarProps = {
    org: { id: string };
    userId: string;
};

export default function MemberSidebar({ org, userId }: MemberSidebarProps) {
    return (
        <>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Member</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={`/o/${org.id}/member`}>
                                    <UserStar />
                                    <span>Member</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <MemberTenantList orgId={org.id} userId={userId} />
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
}
