/**
 * 顧客向け予約画面：日付から探す（サーバーコンポーネント）
 *
 * アクセスURL: /o/[orgId]/reserve/date
 * 役割: 日付ベースの検索画面（DateSearchPage）を呼び出すエントリーポイント。
 */
import { DateSearchPage } from "./_components/DateSearchPage";

type Props = { params: Promise<{ orgId: string }> };

export default async function Page({ params }: Props) {
    const { orgId } = await params;
    return <DateSearchPage orgId={orgId} />;
}
