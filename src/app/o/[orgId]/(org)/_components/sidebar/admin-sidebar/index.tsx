import { Link } from "@/components/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    ShieldUser,
    Store,
    PackagePlus,
    BookCopy,
    ChevronDown,
    UserPen,
} from "lucide-react";

const AdminSidebar = ({ org }: { org: { id: string } }) => {
    return (
        <>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={`/o/${org.id}/admin`}>
                                    <ShieldUser />
                                    <span>Admin</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={`/o/${org.id}/admin/tenant`}>
                                    <Store />
                                    <span>Tenant</span>
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/tenant/create`}
                                        >
                                            <PackagePlus />
                                            <span>作成</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/tenant/list`}
                                        >
                                            <BookCopy />
                                            <span>一覧</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/tenant/employee-assignments`}
                                        >
                                            <UserPen />
                                            <span>従業員割当</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </>
    );
};

export default AdminSidebar;
