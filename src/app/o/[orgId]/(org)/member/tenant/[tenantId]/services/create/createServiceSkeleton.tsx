import { Skeleton } from "@/components/ui/skeleton"

const CreateServiceSkeleton = () => {
    return (
        <div className="mx-auto container px-6 py-10 space-y-6">
            {/* タイトル */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* フォーム本体 */}
            <div className="space-y-5">
                {/* テナントID */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" /> {/* ラベル */}
                    <Skeleton className="h-9 w-full max-w-md" /> {/* Input */}
                </div>

                {/* サービス名 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" /> {/* ラベル */}
                    <Skeleton className="h-9 w-full max-w-md" /> {/* Input */}
                    <Skeleton className="h-4 w-64" /> {/* 説明 */}
                </div>

                {/* サービス説明（リッチテキストエリア想定） */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" /> {/* ラベル */}
                    <Skeleton className="h-32 w-full max-w-2xl" /> {/* Tiptap エリア */}
                    <Skeleton className="h-4 w-40" /> {/* 文字数カウンタなど */}
                </div>

                {/* サービス有効化（スイッチ） */}
                <div className="flex items-center justify-between max-w-md">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-28" /> {/* ラベル */}
                        <Skeleton className="h-4 w-64" /> {/* 説明 */}
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" /> {/* Switch */}
                </div>
            </div>

            {/* フッターボタン */}
            <div className="flex gap-3 justify-end pt-4">
                <Skeleton className="h-9 w-20" /> {/* Reset */}
                <Skeleton className="h-9 w-24" /> {/* Submit */}
            </div>
        </div>
    )
}

export default CreateServiceSkeleton
