/**
 * 顧客向け予約画面：テナントから探す（サーバーコンポーネント）
 *
 * アクセスURL: /reserve/tenant
 * 役割: テナントベースの予約検索画面（TenantSearchPage）を呼び出すエントリーポイント。
 */
import { TenantSearchPage } from "./_components/TenantSearchPage";

export default async function Page() {
    return <TenantSearchPage />;
}
