"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BreadcrumbDropdown } from "./BreadcrumbDropdown";
import { getSegmentLabel, isExistingRoute, truncateLabel } from "./utils";
import type { BreadcrumbSegment } from "./types";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AutoBreadcrumb() {
    const pathname = usePathname();

    // パスをセグメントに分割（空文字列を除外）
    const segments = pathname.split("/").filter((s) => s.length > 0);

    // deepsが3未満（home + 1セグメント以下）の場合は表示しない
    const deeps = segments.length + 1; // +1はhome
    if (deeps < 3) return null;

    // パスセグメントを構築
    const breadcrumbSegments: BreadcrumbSegment[] = [
        { path: "/", label: "Home", isLinkable: true },
    ];

    let currentPath = "";
    for (const segment of segments) {
        currentPath += `/${segment}`;
        breadcrumbSegments.push({
            path: currentPath,
            label: getSegmentLabel(segment),
            isLinkable: isExistingRoute(currentPath),
        });
    }

    // home、一個前、今の場所のインデックス
    const homeIndex = 0;
    const prevIndex = breadcrumbSegments.length - 2;
    const currentIndex = breadcrumbSegments.length - 1;

    // dropdownmenuに入れるセグメント（home・一個前・今の場所以外）
    const dropdownSegments = breadcrumbSegments.filter(
        (_, index) =>
            index !== homeIndex &&
            index !== prevIndex &&
            index !== currentIndex,
    );

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {/* Home */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={breadcrumbSegments[homeIndex].path}>
                            {truncateLabel(breadcrumbSegments[homeIndex].label)}
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Dropdown（中間セグメント） */}
                <BreadcrumbDropdown segments={dropdownSegments} />

                {/* 一個前（存在する場合） */}
                {prevIndex > homeIndex && (
                    <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            {breadcrumbSegments[prevIndex].isLinkable ? (
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={
                                            breadcrumbSegments[prevIndex].path
                                        }
                                    >
                                        {truncateLabel(
                                            breadcrumbSegments[prevIndex].label,
                                        )}
                                    </Link>
                                </BreadcrumbLink>
                            ) : (
                                <span className="text-muted-foreground">
                                    {truncateLabel(
                                        breadcrumbSegments[prevIndex].label,
                                    )}
                                </span>
                            )}
                        </BreadcrumbItem>
                    </>
                )}

                {/* 今の場所 */}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        {truncateLabel(breadcrumbSegments[currentIndex].label)}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
