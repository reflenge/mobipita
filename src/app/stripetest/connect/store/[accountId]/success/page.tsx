/**
 * Connect ストア購入完了ページ
 *
 * ?session_id=cs_xxx で Checkout セッション ID を受け取る
 */

'use client'

import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ConnectStoreSuccessPage() {
    const searchParams = useSearchParams()
    const params = useParams()
    const accountId = params.accountId as string
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
        return (
            <div className="mx-auto max-w-md px-4 py-8">
                <p className="text-muted-foreground">session_id がありません。</p>
                {accountId && (
                    <Button asChild variant="link">
                        <Link href={`/connect/store/${accountId}`}>ストアに戻る</Link>
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-md space-y-4 px-4 py-8">
            <h1 className="text-xl font-semibold">ご購入ありがとうございます</h1>
            <p className="text-muted-foreground">
                お支払いが完了しました。確認メールが送信されます。
            </p>
            {accountId && (
                <Button asChild>
                    <Link href={`/connect/store/${accountId}`}>ストアに戻る</Link>
                </Button>
            )}
        </div>
    )
}
