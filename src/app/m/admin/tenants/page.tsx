import AdminTenantList from "./_components/AdminTenantList";
import { Separator } from "@/components/ui/separator";

export default function AdminTenantsPage() {
    return (
        <div className="container mx-auto flex flex-col gap-8 px-6 py-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                    テナント管理
                </h1>
                <p className="text-muted-foreground text-lg">
                    登録されているすべてのテナント情報を管理します。
                </p>
            </div>
            <Separator />
            <AdminTenantList />
        </div>
    );
}
