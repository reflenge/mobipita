/**
 * Stripe Connect: 商品追加ページ
 *
 * accountId はクエリで受け取る（例: /connect/products?accountId=acct_xxx）
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ConnectProductsPage() {
    return (
        <Suspense fallback={<div className="mx-auto max-w-md px-4 py-8 text-muted-foreground">読み込み中…</div>}>
            <ConnectProductsInner />
        </Suspense>
    )
}

function ConnectProductsInner() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const accountId = searchParams.get('accountId')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [priceInCents, setPriceInCents] = useState('')
    const [currency] = useState('jpy')
    const [loading, setLoading] = useState(false)

    if (!accountId || !accountId.startsWith('acct_')) {
        return (
            <div className="mx-auto max-w-md px-4 py-8">
                <p className="text-muted-foreground">
                    accountId がありません。Connect ダッシュボードから「商品を追加」を開いてください。
                </p>
                <Button variant="link" onClick={() => router.push('/connect')}>
                    ダッシュボードへ
                </Button>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const cents = parseInt(priceInCents, 10)
        if (!name.trim() || isNaN(cents) || cents < 0) {
            toast.error('名前と価格（0以上）を入力してください')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/connect/products/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId,
                    name: name.trim(),
                    description: description.trim() || undefined,
                    priceInCents: cents,
                    currency,
                }),
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || res.statusText)
            toast.success('商品を追加しました')
            setName('')
            setDescription('')
            setPriceInCents('')
            router.push(`/connect/store/${accountId}`)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : '作成に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md space-y-6 px-4 py-8">
            <h1 className="text-xl font-semibold">商品を追加</h1>
            <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">商品名</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">説明（任意）</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        rows={2}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">価格（円）</label>
                    <input
                        type="number"
                        min={0}
                        value={priceInCents}
                        onChange={(e) => setPriceInCents(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        placeholder="1000"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        JPY の場合はそのまま円で入力（1000 = 1000円）
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? '作成中…' : '作成'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/connect')}
                    >
                        キャンセル
                    </Button>
                </div>
            </form>
        </div>
    )
}
