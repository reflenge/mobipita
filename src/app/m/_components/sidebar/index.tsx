import { UserButton } from "@clerk/nextjs";
import AdminSidebar from "./admin-sidebar";
import CompanySidebar from "./company-sidebar";
import StaffSidebar from "./staff-sidebar";
import type { AppRole } from "@/lib/roles";
import { Link } from "@/components/link";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
    SidebarRail,
    SidebarSeparator,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { hasMinRole } from "@/lib/roles";
import { Home } from "lucide-react";
import AccountSidebar from "@/components/account/sidebar";

interface AppSidebarProps {
    user: {
        role: AppRole;
        userId: string;
    };
}

export function AppSidebar({ user }: AppSidebarProps) {
    return (
        <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/m/company">
                                <span className="flex h-6 w-6 aspect-square items-center justify-center rounded bg-linear-to-br from-amber-400 to-teal-500 text-[0.5rem] font-bold text-white">
                                    MP
                                </span>
                                <span>BEYOND KAMPO 管理</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {hasMinRole(user.role, "staff") && <StaffSidebar />}
                {hasMinRole(user.role, "company") && <CompanySidebar />}
                {hasMinRole(user.role, "admin") && <AdminSidebar />}
                <AccountSidebar management />
                <SidebarSeparator />
                <SidebarGroup>
                    <SidebarGroupLabel>利用者向け画面へ</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/home">
                                        <Home />
                                        <span>トップページ</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <UserButton />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
