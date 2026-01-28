"use client";

import * as React from "react";
import NextLink, { type LinkProps as NextLinkProps } from "next/link";
import { Indicator } from "@/components/link/Indicator";

// Next.js の Link をラップして、遷移中のインジケータ表示を自動で付与する共通リンク。
interface LinkProps extends NextLinkProps {
    // NextLink は children 必須だが、型上でも明示して安全にする。
    children: React.ReactNode;
    // className は NextLink の props には含まれないため明示的に受け取る。
    className?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <NextLink ref={ref} className={className} {...props}>
                {/* 任意の子要素をそのまま描画 */}
                {children}
                {/* ルート遷移中のみ画面上部にバーを表示する */}
                <Indicator />
            </NextLink>
        );
    },
);

Link.displayName = "Link";

export { Link };
