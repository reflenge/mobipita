/**
 * 顧客向け予約画面：テナントから探す（サーバーコンポーネント）
 *
 * アクセスURL: /o/[orgId]/reserve/tenant
 * 役割: テナントベースの予約検索画面（TenantSearchPage）を呼び出すエントリーポイント。
 */
import { TenantSearchPage } from "./_components/TenantSearchPage";

type Props = { params: Promise<{ orgId: string }> };

export default async function Page({ params }: Props) {
    const { orgId } = await params;
    return <TenantSearchPage orgId={orgId} />;
}
