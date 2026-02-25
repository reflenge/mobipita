/**
 * 顧客向け予約画面：予約フォーム画面（サーバーコンポーネント）
 *
 * アクセスURL: /o/[orgId]/tenant/[tenantId]/book/[slotId]
 * 役割: 顧客が予約を確定するための情報入力画面（BookingForm）のエントリーポイント。
 */
import { BookingForm } from "./_components/BookingForm";

type Props = {
    params: Promise<{ orgId: string; tenantId: string; slotId: string }>;
};

export default async function BookSlotPage({ params }: Props) {
    const { orgId, tenantId, slotId } = await params;
    return <BookingForm orgId={orgId} tenantId={tenantId} slotId={slotId} />;
}
