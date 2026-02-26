/**
 * 顧客向け予約画面：テナント詳細 / 予約枠一覧（サーバーコンポーネント）
 *
 * アクセスURL: /tenant/[tenantId]
 * 役割: 指定されたテナント (tenantId) の予約枠一覧を表示する TenantSlots コンポーネントの
 * エントリーポイント。
 */
import { TenantSlots } from "./_components/TenantSlots";

type Props = {
    params: Promise<{ tenantId: string }>;
};

export default async function TenantDetailPage({ params }: Props) {
    const { tenantId } = await params;
    return <TenantSlots tenantId={tenantId} />;
}
