/**
 * 顧客向け予約画面：サービスから探す（サーバーコンポーネント）
 *
 * アクセスURL: /reserve/service
 * 役割: サービスベースの予約検索画面（ServiceSearchPage）を呼び出すエントリーポイント。
 */
import { ServiceSearchPage } from "./_components/ServiceSearchPage";

export default async function Page() {
    return <ServiceSearchPage />;
}
