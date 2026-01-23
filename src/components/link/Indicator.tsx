"use client";

import { useLinkStatus } from "next/link";

// Next.js のルート遷移中だけ表示される上部バーのインジケータ。
// useLinkStatus の pending が true の間だけ描画する。
export function Indicator() {
    const { pending } = useLinkStatus();

    return pending ? (
        // fixed で画面上部に貼り付け、globals.css の .indicator でアニメーションさせる。
        <span className="fixed left-0 top-0 z-1 h-0.75 bg-blue-300 opacity-50 indicator" />
    ) : null;
}
