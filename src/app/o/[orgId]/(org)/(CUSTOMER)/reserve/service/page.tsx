/**
 * 顧客向け予約画面：サービスから探す（サーバーコンポーネント）
 *
 * アクセスURL: /o/[orgId]/reserve/service
 * 役割: サービスベースの予約検索画面（ServiceSearchPage）を呼び出すエントリーポイント。
 */
import { ServiceSearchPage } from "./_components/ServiceSearchPage";

type Props = { params: Promise<{ orgId: string }> };

export default async function Page({ params }: Props) {
    const { orgId } = await params;
    return <ServiceSearchPage orgId={orgId} />;
}
