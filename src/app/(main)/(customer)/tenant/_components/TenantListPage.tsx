"use client";

/**
 * TenantListPage コンポーネント (テナント一覧)
 *
 * 役割: テナント一覧を表示し、キーワード検索で絞り込む。
 * 選択されたテナントの詳細や予約枠一覧 (既存の TenantSlots と同様の画面) へ遷移する。
 */
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowLeftIcon, SearchIcon, StoreIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TenantListPage() {
    const router = useRouter();
    const [keyword, setKeyword] = useState("");

    const tenants = useQuery(api.tenants.list, {});

    const filteredTenants = useMemo(() => {
        if (!tenants) return undefined;
        const q = keyword.trim().toLowerCase();
        if (!q) return tenants;
        return tenants.filter((t) => t.tenantName.toLowerCase().includes(q));
    }, [tenants, keyword]);

    return (
        <div className="mx-auto max-w-2xl space-y-4 px-6 py-10">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/">
                        <ArrowLeftIcon className="mr-1 size-4" />
                        トップへ戻る
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-xl font-semibold">テナント一覧</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">
                    一覧からテナントを選択して、詳細や予約枠を確認できます
                </p>
            </div>

            <div className="relative">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    type="search"
                    placeholder="テナント名で検索"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredTenants === undefined ? (
                <div className="bg-muted text-muted-foreground flex h-32 items-center justify-center rounded-md border text-sm">
                    読み込み中...
                </div>
            ) : filteredTenants.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground py-8 text-center">
                        該当するテナントがありません
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredTenants.map((t) => (
                        <Card
                            key={t._id}
                            className="hover:bg-accent group cursor-pointer transition-colors"
                            onClick={() => router.push(`/tenant/${t._id}`)}
                        >
                            <CardContent className="px-5 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <div className="text-base font-medium">
                                            {t.tenantName}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {t.tenantType}
                                            {t.storeType
                                                ? ` · ${t.storeType}`
                                                : ""}
                                        </div>
                                    </div>
                                    <StoreIcon className="text-muted-foreground group-hover:text-foreground size-5 shrink-0 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
