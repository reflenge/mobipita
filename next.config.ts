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
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "https",
                hostname: "charming-buffalo-538.convex.cloud", // 👈 これを追加！
                pathname: "/api/storage/**",
            },
        ],
    },
};

export default nextConfig;
