import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // React Compiler を有効化（パフォーマンス最適化）
    reactCompiler: true,
    // URL の末尾のスラッシュを削除
    trailingSlash: false,
    // 開発インジケーター（ "Fast Refresh" ラベル）を非表示
    devIndicators: false,
    // 外部画像の設定
    images: {
        // Clerk の画像を許可するリモートパターン
        remotePatterns: [new URL("https://img.clerk.com/**")],
    },
    //
    compiler: {
        // コンソールログを削除
        removeConsole: true,
    },
};

export default nextConfig;
