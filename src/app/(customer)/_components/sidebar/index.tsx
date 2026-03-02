import { UserButton } from "@clerk/nextjs";
import {
    CalendarCheck,
    CalendarIcon,
    Home,
    LayoutDashboard,
    MapPinIcon,
    SearchIcon,
    ShoppingBagIcon,
    StoreIcon,
    UserCircle,
} from "lucide-react";
import type { AppRole } from "@/lib/roles";
import AccountSidebar from "@/components/account/sidebar";
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
    SidebarGroupLabel,
    SidebarSeparator,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { hasMinRole } from "@/lib/roles";

interface AppSidebarProps {
    user: {
        role: AppRole;
        userId: string;
    };
}

export function AppSidebar({ user }: AppSidebarProps) {
    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            variant="floating"
            collapsible="icon"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/home">
                                <span className="flex aspect-square h-6 w-6 items-center justify-center rounded bg-linear-to-br from-amber-400 to-teal-500 text-[0.5rem] font-bold text-white">
                                    MP
                                </span>
                                <span>BEYOND KAMPO</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>カスタマー</SidebarGroupLabel>
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
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <SearchIcon />
                                    <span>探す</span>
                                </SidebarMenuButton>
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/reserve/tenant">
                                                <StoreIcon />
                                                <span>テナントから探す</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/reserve/location">
                                                <MapPinIcon />
                                                <span>場所から探す</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/reserve/date">
                                                <CalendarIcon />
                                                <span>日付から探す</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton asChild>
                                            <Link href="/reserve/service">
                                                <ShoppingBagIcon />
                                                <span>サービスから探す</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                </SidebarMenuSub>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/tenant">
                                        <StoreIcon />
                                        <span>テナント一覧</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/bookings">
                                        <CalendarCheck />
                                        <span>マイ予約</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/profile">
                                        <UserCircle />
                                        <span>マイページ</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <AccountSidebar />
                {hasMinRole(user.role, "staff") && (
                    <>
                        <SidebarSeparator />
                        <SidebarGroup>
                            <SidebarGroupLabel>管理画面へ</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <Link href="/m/staff">
                                                <LayoutDashboard />
                                                <span>スタッフ</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>
            <SidebarFooter>
                <UserButton />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
