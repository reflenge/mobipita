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
    UserPlus,
    UsersRound,
} from "lucide-react";

const AdminSidebar = ({ org }: { org: { id: string } }) => {
    return (
        <>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>管理者</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={`/o/${org.id}/admin`}>
                                    <ShieldUser />
                                    <span>管理者</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={`/o/${org.id}/admin/tenant`}>
                                    <Store />
                                    <span>テナント</span>
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/tenant/create`}
                                        >
                                            <PackagePlus />
                                            <span>作成</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/tenant/list`}
                                        >
                                            <BookCopy />
                                            <span>一覧</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={`/o/${org.id}/admin/employee`}>
                                    <UsersRound />
                                    <span>従業員</span>
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/employee`}
                                        >
                                            <BookCopy />
                                            <span>一覧</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/employee/upgrade`}
                                        >
                                            <UserPlus />
                                            <span>従業員へ昇格</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link
                                            href={`/o/${org.id}/admin/employee/assignment`}
                                        >
                                            <Store />
                                            <span>各テナントへ振り分け</span>
                                        </Link>
                                    </SidebarMenuSubButton>
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
