/**
 * 顧客向け予約画面：テナント一覧（サーバーコンポーネント）
 *
 * アクセスURL: /tenant
 * 役割: テナント一覧を表示する画面のエントリーポイント。
 */
import { TenantListPage } from "./_components/TenantListPage";

export default async function Page() {
    return <TenantListPage />;
}
