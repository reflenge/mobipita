"use client";

import { useOrganizationList } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type OrganizationMembershipListProps = {
    title?: string;
    className?: string;
};

export default function OrganizationMembershipList({
    title = "所属組織",
    className,
}: OrganizationMembershipListProps) {
    const { isLoaded, userMemberships } = useOrganizationList({
        userMemberships: { infinite: true },
    });
    const pathname = usePathname();
    console.log("🚀 => OrganizationMembershipList => pathname:", pathname);
    const router = useRouter();
    const memberships = userMemberships?.data ?? [];
    const singleMembership = memberships.length === 1 ? memberships[0] : null;

    // useEffect(() => {
    //     if (!isLoaded) {
    //         return;
    //     }

    //     if (!singleMembership) {
    //         return;
    //     }

    //     if (pathname !== "/") {
    //         return;
    //     }

    //     const organizationId = singleMembership.organization.id;
    //     router.replace(`/${organizationId}`);
    // }, [isLoaded, pathname, router, singleMembership]);

    if (!isLoaded) {
        return (
            <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col gap-4 px-6 py-10">
                {title}
                <div className="grid gap-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </main>
        );
    }
    const containerClassName = [
        "mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col gap-4 px-6 py-10",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <main className={containerClassName}>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {memberships.length === 0 ? (
                <Card className="flex items-center justify-center p-10">
                    <p className="text-sm text-muted-foreground">
                        所属している組織がありません。
                    </p>
                </Card>
            ) : (
                <ul className="grid gap-3">
                    {memberships.map((membership) => {
                        const organization = membership.organization;
                        const organizationId = organization.id;

                        return (
                            <li key={membership.id}>
                                <Link href={`/${organizationId}`}>
                                    <Card className="transition hover:border-foreground/40 cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="size-12">
                                                        <AvatarImage
                                                            src={
                                                                organization.imageUrl
                                                            }
                                                            alt={
                                                                organization.name
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {organization.name
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col gap-2">
                                                        <CardTitle>
                                                            {organization.name}
                                                        </CardTitle>
                                                        <CardDescription className="flex flex-col gap-1">
                                                            <span>
                                                                {
                                                                    organization.slug
                                                                }
                                                            </span>
                                                            <span className="text-xs">
                                                                /
                                                                {organizationId}
                                                            </span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">
                                                    進む →
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}
