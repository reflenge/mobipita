"use client";

import dynamic from "next/dynamic";

// クライアントコンポーネントの中で ssr: false を使うのはOKです
const Breadcrumb = dynamic(() => import("./index"), { 
    ssr: false,
    loading: () => <div className="h-6 w-32 animate-pulse rounded bg-muted" /> 
});

export default function SafeBreadcrumb() {
    return <Breadcrumb />;
}