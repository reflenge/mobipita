"use client";

import { useLinkStatus } from "next/link";
import "./indicator.css";

// Next.js のルート遷移中だけ表示される上部バーのインジケータ。
// useLinkStatus の pending が true の間だけ描画する。
export function Indicator() {
    const { pending } = useLinkStatus();

    return pending ? (
        <span className="indicator fixed top-0 left-0 z-1 h-0.75 bg-blue-300 opacity-50" />
    ) : null;
}
