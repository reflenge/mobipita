/**
 * 顧客向け予約画面：テナント一覧（サーバーコンポーネント）
 *
 * アクセスURL: /o/[orgId]/tenant
 * 役割: 組織に紐づくテナント一覧を表示する画面のエントリーポイント。
 */
import { TenantListPage } from "./_components/TenantListPage";

type Props = { params: Promise<{ orgId: string }> };

export default async function Page({ params }: Props) {
    const { orgId } = await params;
    return <TenantListPage orgId={orgId} />;
}
