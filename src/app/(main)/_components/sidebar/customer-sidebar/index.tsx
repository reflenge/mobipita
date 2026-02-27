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
} from "@/components/ui/sidebar";
import {
    CalendarCheck,
    CalendarIcon,
    Home,
    MapPinIcon,
    ShoppingBagIcon,
    StoreIcon,
    SearchIcon,
    UserCircle,
} from "lucide-react";

export default function CustomerSidebar() {
    return (
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
    );
}
