"use client";

/**
 * TenantSearchPage コンポーネント (テナントから探す)
 *
 * 役割: 組織に紐づくテナント一覧を表示し、キーワード検索で絞り込む。
 * 選択されたテナントの持つ予約枠一覧 (既存の TenantSlots と同様の画面) へ遷移する。
 */
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/link";
import { ArrowLeftIcon, SearchIcon, StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { orgId: string };

export function TenantSearchPage({ orgId }: Props) {
    const router = useRouter();
    const [keyword, setKeyword] = useState("");

    const tenants = useQuery(api.tenants.listByOrg, {
        clerkOrgId: orgId,
    });

    const filteredTenants = useMemo(() => {
        if (!tenants) return undefined;
        const q = keyword.trim().toLowerCase();
        if (!q) return tenants;
        return tenants.filter(
            (t) => t.tenantName.toLowerCase().includes(q)
        );
    }, [tenants, keyword]);

    return (
        <div className="mx-auto max-w-2xl py-10 px-6 space-y-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/o/${orgId}`}>
                        <ArrowLeftIcon className="size-4 mr-1" />
                        トップへ戻る
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-semibold">テナントから探す</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    テナント（店舗等）を選択すると予約可能な枠が表示されます
                </p>
            </div>

            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="テナント名で検索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredTenants === undefined ? (
                <div className="flex h-32 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                    読み込み中...
                </div>
            ) : filteredTenants.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        該当するテナントがありません
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredTenants.map((t) => (
                        <Card
                            key={t._id}
                            className="cursor-pointer transition-colors hover:bg-accent group"
                            onClick={() => router.push(`/o/${orgId}/tenant/${t._id}`)}
                        >
                            <CardContent className="py-4 px-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-0.5 flex-1">
                                        <div className="font-medium text-base">{t.tenantName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {t.tenantType}{t.storeType ? ` · ${t.storeType}` : ""}
                                        </div>
                                    </div>
                                    <StoreIcon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
