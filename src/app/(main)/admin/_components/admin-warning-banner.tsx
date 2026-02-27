"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const REAPPEAR_INTERVAL_MS = 30_000;

export function AdminWarningBanner() {
    const [expanded, setExpanded] = useState(true);

    const dismiss = useCallback(() => setExpanded(false), []);
    const open = useCallback(() => setExpanded(true), []);

    useEffect(() => {
        if (expanded) return;

        const timer = setTimeout(() => setExpanded(true), REAPPEAR_INTERVAL_MS);
        return () => clearTimeout(timer);
    }, [expanded]);

    if (!expanded) {
        return (
            <button
                onClick={open}
                className="fixed top-4 right-4 z-50 rounded-md bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-700"
                aria-label="管理者警告を表示"
            >
                <AlertTriangle className="size-5" />
            </button>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-72 rounded-lg bg-red-600 p-4 text-white shadow-lg">
            <button
                onClick={dismiss}
                className="absolute top-2 right-2 rounded p-0.5 transition-colors hover:bg-red-700"
                aria-label="閉じる"
            >
                <X className="size-4" />
            </button>
            <div className="text-lg font-bold">⚠ 管理者向け</div>
            <p className="mt-1 text-sm leading-snug">
                この画面は管理者専用です。操作には注意してください。
            </p>
        </div>
    );
}
