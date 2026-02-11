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
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

interface AppSidebarProps {
    org: {
        id: string;
        name: string;
        imageUrl: string;
    };
    user: {
        role: string;
        userId: string;
    };
}

export function AppSidebar({ org, user }: AppSidebarProps) {
    // 1. この組織に紐づくテナント一覧を取得
    const tenants = useQuery(api.tenants.listByOrg, { clerkOrgId: org.id });

    // 2. 表示するデータの決定（テナントがあればその1つ目、なければClerkの組織情報）
    // ※ バックエンドの listByOrg で logoUrl を返すようにしている前提です
    const firstTenant = tenants?.[0];
    const displayImage = firstTenant?.logoUrl ?? org.imageUrl;
    const displayName = firstTenant?.tenantName ?? org.name;
    
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
                    <MemberSidebar org={org} userId={user.userId} />
                )}

                {user.role === "org:admin" && <AdminSidebar org={org} />}
            </SidebarContent>

            {/* ここを修正 */}
            <SidebarFooter className="flex items-center justify-start p-4">
                <ClerkLoading>
                    {/* ロード中に表示されるスケルトン（ボタンの代わりに丸を表示） */}
                    <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                </ClerkLoading>
                <ClerkLoaded>
                    {/* ロード完了後に表示される */}
                    <UserButton afterSignOutUrl="/" />
                </ClerkLoaded>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}