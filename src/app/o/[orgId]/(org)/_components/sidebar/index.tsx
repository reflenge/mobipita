import { ShieldUser, Home, UserStar } from "lucide-react";
import Image from "next/image";
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
import { Link } from "@/components/link";
import {
    ClerkLoaded,
    ClerkLoading,
    OrganizationSwitcher,
    UserButton,
} from "@clerk/nextjs";
import AdminSidebar from "./admin-sidebar";
import CustomerSidebar from "./customer-sidebar";
import MemberSidebar from "./member-sidebar";

interface AppSidebarProps {
    org: {
        id: string;
        name: string;
        imageUrl: string;
    };
    user: {
        role: string;
    };
}

export function AppSidebar({ org, user }: AppSidebarProps) {
    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={`/o/${org.id}`}>
                                <Image
                                    src={org.imageUrl}
                                    alt={`${org.name} logo`}
                                    width={32}
                                    height={32}
                                    className="rounded-sm"
                                />
                                <span>{org.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <CustomerSidebar org={org} />
                {(user.role === "org:member" || user.role === "org:admin") && (
                    <MemberSidebar org={org} />
                )}

                {user.role === "org:admin" && <AdminSidebar org={org} />}
            </SidebarContent>
            <SidebarFooter>
                <UserButton fallback={<SidebarMenuSkeleton />} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
