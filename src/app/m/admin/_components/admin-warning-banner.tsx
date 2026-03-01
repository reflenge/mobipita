"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import "./admin-warning-banner.css";

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
            <div className="admin-warning-border fixed top-4 right-4 z-50 rounded-md p-[2px] shadow-lg">
                <button
                    onClick={open}
                    className="flex size-10 items-center justify-center rounded-[calc(0.375rem-2px)] bg-red-600 text-white transition-colors hover:bg-red-700"
                    aria-label="管理者警告を表示"
                >
                    <AlertTriangle className="size-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="admin-warning-border fixed top-4 right-4 z-50 w-72 rounded-lg p-[2px] shadow-lg">
            <div className="relative rounded-[calc(0.5rem-2px)] bg-red-600 p-4 pr-8 text-white">
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
        </div>
    );
}
