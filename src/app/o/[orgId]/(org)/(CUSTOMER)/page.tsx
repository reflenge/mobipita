/**
 * 顧客向け予約画面：トップページ
 *
 * アクセスURL: /o/[orgId]
 * 役割: 顧客が予約を行う際の検索方法（場所から探す、日付から探す、サービスから探す）
 * を一覧表示し、目的の検索画面へ誘導するメニュー画面。
 */
import { BookingSearch } from "./_components/BookingSearch";

type OrganizationPageProps = {
    params: Promise<{ orgId: string }>;
};

export default async function OrganizationPage({
    params,
}: OrganizationPageProps) {
    const { orgId } = await params;
    return <BookingSearch orgId={orgId} />;
}
