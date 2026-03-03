"use client";

import * as React from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Edit2, FileText, ImageIcon, Info, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
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
            <div className="grid gap-8">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="space-y-4 p-6">
                        <Skeleton className="h-20 w-20 rounded-xl" />
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-44" />
                    </div>
                </section>
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="p-6">
                        <Skeleton className="h-4 w-40" />
                    </div>
                </section>
            </div>
        );
    }

    if (!tenant) {
        return (
            <section className="overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white shadow-sm">
                <div className="p-6">
                    <h2 className="text-xl font-semibold">
                        テナントが見つかりません
                    </h2>
                    <p className="mt-2 text-base text-slate-500">
                        すでに削除されたか、権限がありません。
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/m/company/tenant">一覧へ戻る</Link>
                    </Button>
                </div>
            </section>
        );
    }

    const status = statusLabels[tenant.tenantStatus] ?? "不明";
    const type = typeLabels[tenant.tenantType] ?? "不明";
    const storeType =
        storeTypeLabels[tenant.storeType] ?? tenant.storeType;
    const createdAt = new Date(tenant._creationTime).toLocaleString(
        "ja-JP",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    return (
        <div className="grid gap-8">
            {/* ── カード1: テナント基本情報 ── */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Info className="size-5 text-orange-500" />
                        基本情報
                    </h2>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/m/company/tenant/${tenantId}/edit`}
                        >
                            <Edit2 className="size-4" />
                            基本情報を編集
                        </Link>
                    </Button>
                </div>
                <div className="space-y-8 p-6">
                    {/* ロゴ + テナント名 */}
                    <div className="flex items-center gap-6">
                        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            <div className="flex flex-col items-center text-slate-400">
                                <ImageIcon className="size-8" />
                            </div>
                            {tenant.logoUrl && (
                                <img
                                    src={tenant.logoUrl}
                                    alt={tenant.tenantName}
                                    loading="eager"
                                    crossOrigin="anonymous"
                                    decoding="async"
                                    className="absolute inset-0 h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />
                            )}
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-medium text-slate-500">
                                テナント名
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {tenant.tenantName}
                            </h3>
                        </div>
                    </div>

                    {/* 情報テーブル */}
                    <div className="grid max-w-2xl gap-0">
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                ステータス
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-bold ${statusStyle[tenant.tenantStatus] ?? ""}`}
                            >
                                {status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                テナント種別
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-bold ${typeStyle[tenant.tenantType] ?? ""}`}
                            >
                                {type}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                店舗形態
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-bold ${storeTypeStyle[tenant.storeType] ?? ""}`}
                            >
                                {storeType}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                作成日時
                            </span>
                            <span className="text-base font-semibold text-slate-800">
                                {createdAt}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-base font-medium text-slate-500">
                                作成者
                            </span>
                            <span className="font-mono text-base text-slate-800">
                                {tenant.createdByUserId ?? "不明"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── カード2: 詳細情報 ── */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <FileText className="size-5 text-orange-500" />
                        詳細情報
                    </h2>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/m/company/tenant/${tenantId}/edit-detail`}
                        >
                            <Edit2 className="size-4" />
                            詳細情報を編集
                        </Link>
                    </Button>
                </div>
                <div className="p-6">
                    <div className="grid max-w-2xl gap-0">
                        <div className="flex items-center justify-between py-3">
                            <span className="text-base font-medium text-slate-500">
                                連絡先（電話番号）
                            </span>
                            <span className="text-lg font-bold tracking-wider text-slate-900">
                                {tenant.phoneNumber || "未設定"}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 削除セクション ── */}
            <div className="flex justify-center pt-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red-200 bg-white px-6 py-3 text-base font-bold text-red-600 shadow-sm transition-all hover:bg-red-50"
                        >
                            <Trash2 className="mr-2 size-5" />
                            テナントを削除
                        </button>
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
