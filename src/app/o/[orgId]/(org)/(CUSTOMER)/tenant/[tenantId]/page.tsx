/**
 * 顧客向け予約画面：テナント詳細 / 予約枠一覧（サーバーコンポーネント）
 *
 * アクセスURL: /o/[orgId]/tenant/[tenantId]
 * 役割: 指定されたテナント (tenantId) の予約枠一覧を表示する TenantSlots コンポーネントの
 * エントリーポイント。
 */
import { TenantSlots } from "./_components/TenantSlots";

type Props = {
    params: Promise<{ orgId: string; tenantId: string }>;
};

export default async function TenantDetailPage({ params }: Props) {
    const { orgId, tenantId } = await params;
    return <TenantSlots orgId={orgId} tenantId={tenantId} />;
}
