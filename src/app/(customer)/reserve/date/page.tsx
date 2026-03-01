/**
 * 顧客向け予約画面：日付から探す（サーバーコンポーネント）
 *
 * アクセスURL: /reserve/date
 * 役割: 日付ベースの検索画面（DateSearchPage）を呼び出すエントリーポイント。
 */
import { DateSearchPage } from "./_components/DateSearchPage";

export default async function Page() {
    return <DateSearchPage />;
}
