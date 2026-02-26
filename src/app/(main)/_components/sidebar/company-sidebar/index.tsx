import { Link } from "@/components/link";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    ShieldUser,
    Store,
    PackagePlus,
    BookCopy,
    UserPlus,
    UsersRound,
} from "lucide-react";

export default function CompanySidebar() {
    return (
        <>
            <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>会社管理</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/company">
                                    <ShieldUser />
                                    <span>会社管理</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/company/tenant">
                                    <Store />
                                    <span>テナント</span>
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/company/tenant/create">
                                            <PackagePlus />
                                            <span>作成</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/company/tenant/list">
                                            <BookCopy />
                                            <span>一覧</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/company/employee">
                                    <UsersRound />
                                    <span>従業員</span>
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/company/employee">
                                            <BookCopy />
                                            <span>一覧</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/company/employee/upgrade">
                                            <UserPlus />
                                            <span>ロール変更</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                        <Link href="/company/employee/assignment">
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
}
