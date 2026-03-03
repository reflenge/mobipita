"use client";

import * as React from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Edit2, ImageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<string, string> = {
    preparing: "準備中",
    open: "公開中",
    paused: "一時停止",
    closed: "終了",
};

const typeLabels: Record<string, string> = {
    direct: "直営",
    tenant: "テナント",
};

const storeTypeLabels: Record<string, string> = {
    mobile: "移動店舗",
    fixed: "固定店舗",
};

const statusStyle: Record<string, string> = {
    preparing: "bg-yellow-100 text-yellow-700 border-yellow-200",
    open: "bg-green-100 text-green-700 border-green-200",
    paused: "bg-gray-100 text-gray-600 border-gray-200",
    closed: "bg-red-100 text-red-700 border-red-200",
};

const typeStyle: Record<string, string> = {
    direct: "bg-orange-100 text-orange-700 border-orange-200",
    tenant: "bg-slate-100 text-slate-600 border-slate-200",
};

const storeTypeStyle: Record<string, string> = {
    mobile: "bg-blue-100 text-blue-700 border-blue-200",
    fixed: "bg-slate-100 text-slate-600 border-slate-200",
};

type TenantDetailProps = {
    tenantId: string;
};

const TenantDetail = ({ tenantId }: TenantDetailProps) => {
    const router = useRouter();
    const { isAuthenticated } = useConvexAuth();
    const tenant = useQuery(
        api.tenants.getById,
        isAuthenticated
            ? { tenantId: tenantId as Id<"Tenants"> }
            : "skip",
    );
    const removeTenant = useMutation(api.tenants.remove);
    const [isDeleting, startTransition] = React.useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                await removeTenant({
                    tenantId: tenantId as Id<"Tenants">,
                });
                toast("テナントを削除しました", {
                    position: "bottom-right",
                });
                router.push("/m/company/tenant");
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : "Unknown error";
                toast("テナントの削除に失敗しました", {
                    description: message,
                    position: "bottom-right",
                });
            }
        });
    };

    if (tenant === undefined) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="gap-3">
                        <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-44" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="gap-3">
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!tenant) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>テナントが見つかりません</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        すでに削除されたか、権限がありません。
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/m/company/tenant">一覧へ戻る</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const status = statusLabels[tenant.tenantStatus] ?? "不明";
    const type = typeLabels[tenant.tenantType] ?? "不明";
    const storeType = storeTypeLabels[tenant.storeType] ?? tenant.storeType;
    const createdAt = new Date(tenant._creationTime).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="space-y-6">
            {/* ── カード1: テナント基本情報 ── */}
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="text-xl">
                            基本情報
                        </CardTitle>
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={`/m/company/tenant/${tenantId}/edit`}
                            >
                                <Edit2 className="size-4" />
                                基本情報を編集
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* ロゴ + テナント名 */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 relative">
                            <div className="text-gray-400 flex flex-col items-center">
                                <ImageIcon className="size-6" />
                            </div>
                            {tenant.logoUrl && (
                                <img
                                    src={tenant.logoUrl}
                                    alt={tenant.tenantName}
                                    loading="eager"
                                    crossOrigin="anonymous"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            )}
                        </div>
                        <h2 className="text-lg font-bold">
                            {tenant.tenantName}
                        </h2>
                    </div>

                    {/* 情報テーブル */}
                    <div className="text-muted-foreground space-y-3 text-base">
                        <div className="flex items-center justify-between">
                            <span>ステータス</span>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 text-sm font-semibold rounded-full border ${statusStyle[tenant.tenantStatus] ?? ""}`}
                            >
                                {status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>テナント種別</span>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 text-sm font-semibold rounded-full border ${typeStyle[tenant.tenantType] ?? ""}`}
                            >
                                {type}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>店舗形態</span>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 text-sm font-semibold rounded-full border ${storeTypeStyle[tenant.storeType] ?? ""}`}
                            >
                                {storeType}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>作成日時</span>
                            <span className="text-foreground">
                                {createdAt}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>作成者</span>
                            <span className="text-foreground">
                                {tenant.createdByUserId ?? "不明"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── カード2: 詳細情報 ── */}
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle className="text-xl">
                            詳細情報
                        </CardTitle>
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href={`/m/company/tenant/${tenantId}/edit-detail`}
                            >
                                <Edit2 className="size-4" />
                                詳細情報を編集
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-3 text-base">
                    <div className="flex items-center justify-between">
                        <span>連絡先（電話番号）</span>
                        <span className="text-foreground">
                            {tenant.phoneNumber || "未設定"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* ── 削除セクション ── */}
            <div className="flex justify-end pt-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="size-4" />
                            テナントを削除
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                テナントを削除しますか？
                            </DialogTitle>
                            <DialogDescription>
                                「{tenant.tenantName}
                                」を削除します。この操作は元に戻せません。
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">
                                    キャンセル
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting
                                    ? "削除中..."
                                    : "削除する"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default TenantDetail;
