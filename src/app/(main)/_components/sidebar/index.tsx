import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "@/components/link";
import { UserButton } from "@clerk/nextjs";
import AdminSidebar from "./admin-sidebar";
import CustomerSidebar from "./customer-sidebar";
import StaffSidebar from "./staff-sidebar";
import ReflengeSidebar from "./reflenge-sidebar";
import type { AppRole } from "@/lib/roles";
import { hasMinRole } from "@/lib/roles";

interface AppSidebarProps {
    user: {
        role: AppRole;
        userId: string;
    };
}

export function AppSidebar({ user }: AppSidebarProps) {
    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/home">
                                <span className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-amber-400 to-teal-500 text-[0.5rem] font-bold text-white">
                                    MP
                                </span>
                                <span>BEYOND KAMPO</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <CustomerSidebar />
                {hasMinRole(user.role, "staff") && <StaffSidebar />}
                {hasMinRole(user.role, "beyondKampo") && <AdminSidebar />}
                {hasMinRole(user.role, "reflenge") && <ReflengeSidebar />}
            </SidebarContent>
            <SidebarFooter>
                <UserButton />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
