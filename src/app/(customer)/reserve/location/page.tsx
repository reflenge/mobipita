/**
 * 顧客向け予約画面：場所から探す（サーバーコンポーネント）
 *
 * アクセスURL: /reserve/location
 * 役割: ロケーションベースの予約検索画面（StoreSearch）を呼び出すエントリーポイント。
 */
import { StoreSearch } from "./_components/StoreSearch";

export default async function SearchPage() {
    return <StoreSearch />;
}
