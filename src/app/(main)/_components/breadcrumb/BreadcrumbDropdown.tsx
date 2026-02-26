"use client";

import Link from "next/link";
import {
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { BreadcrumbSegment } from "./types";
import { truncateLabel } from "./utils";

type Props = {
    segments: BreadcrumbSegment[];
};

export function BreadcrumbDropdown({ segments }: Props) {
    if (segments.length === 0) return null;

    return (
        <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost">
                            <BreadcrumbEllipsis />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuGroup>
                            {segments.map((segment) => (
                                <DropdownMenuItem key={segment.path} asChild>
                                    {segment.isLinkable ? (
                                        <Link
                                            href={segment.path}
                                            className="w-full"
                                        >
                                            {truncateLabel(segment.label)}
                                        </Link>
                                    ) : (
                                        <span className="w-full">
                                            {truncateLabel(segment.label)}
                                        </span>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </BreadcrumbItem>
        </>
    );
}
