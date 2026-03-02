/**
 * 顧客向け予約画面：マイ予約（予約履歴）ページ（サーバーコンポーネント）
 *
 * アクセスURL: /bookings
 * 役割: 顧客自身の予約一覧を表示する MyBookingsList コンポーネントのエントリーポイント。
 */
import { MyBookingsList } from "./_components/MyBookingsList";

export default async function MyBookingsPage() {
    return <MyBookingsList />;
}
