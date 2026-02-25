import { Link } from "@/components/link";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CalendarCheck, CalendarIcon, Home, MapPinIcon, ShoppingBagIcon } from "lucide-react";

const CustomerSidebar = ({ org }: { org: { id: string } }) => {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>カスタマー</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={`/o/${org.id}`}>
                                <Home />
                                <span>トップページ</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={`/o/${org.id}/reserve/location`}>
                                <MapPinIcon />
                                <span>場所から探す</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={`/o/${org.id}/reserve/date`}>
                                <CalendarIcon />
                                <span>日付から探す</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={`/o/${org.id}/reserve/service`}>
                                <ShoppingBagIcon />
                                <span>サービスから探す</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href={`/o/${org.id}/bookings`}>
                                <CalendarCheck />
                                <span>マイ予約</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

export default CustomerSidebar;
