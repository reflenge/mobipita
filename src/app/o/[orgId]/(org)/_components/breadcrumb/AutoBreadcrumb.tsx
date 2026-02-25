"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import type { BreadcrumbSegment } from "./types";
import { getSegmentLabel, isExistingOrgRoute, truncateLabel } from "./utils";
import { BreadcrumbDropdown } from "./BreadcrumbDropdown";

export default function AutoBreadcrumb() {
    const pathname = usePathname();

    // /o/[orgId] をhomeとして、それ以降のパスを解析
    const pathMatch = pathname.match(/^\/o\/([^/]+)(\/.*)?$/);
    if (!pathMatch) return null;

    const orgId = pathMatch[1];
    const restPath = pathMatch[2] || "";

    // パスをセグメントに分割（空文字列を除外）
    const segments = restPath.split("/").filter((s) => s.length > 0);

    // deepsが3未満（home + 1セグメント以下）の場合は表示しない
    const deeps = segments.length + 1; // +1はhome
    if (deeps < 3) return null;

    // パスセグメントを構築
    const breadcrumbSegments: BreadcrumbSegment[] = [
        { path: `/o/${orgId}`, label: "Home", isLinkable: true },
    ];

    let currentPath = `/o/${orgId}`;
    for (const segment of segments) {
        currentPath += `/${segment}`;
        const orgScopedPath =
            currentPath.replace(new RegExp(`^/o/${orgId}`), "") || "/";
        breadcrumbSegments.push({
            path: currentPath,
            label: getSegmentLabel(segment),
            isLinkable: isExistingOrgRoute(orgScopedPath),
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
