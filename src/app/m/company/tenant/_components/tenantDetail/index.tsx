"use client";

import * as React from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Edit2, Info, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    STORE_TYPE_STYLE,
    TENANT_STATUS_STYLE,
    TENANT_TYPE_STYLE,
    getTenantDisplayLabels,
} from "@/lib/tenant";
import TenantLogo from "../TenantLogo";

type TenantDetailProps = {
    tenantId: string;
};

/**
 * company ロール向けテナント詳細ページ。
 * テナント情報カード + 削除セクションの2構成。
 * 編集ボタンから編集ページへ遷移できる。
 */
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
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-52" />
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

    const { status, type, storeType } = getTenantDisplayLabels(tenant);
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
            {/* ── テナント情報 ── */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Info className="size-5 text-orange-500" />
                        テナント情報
                    </h2>
                    <Button asChild variant="outline">
                        <Link
                            href={`/m/company/tenant/${tenantId}/edit`}
                        >
                            <Edit2 className="size-4" />
                            編集
                        </Link>
                    </Button>
                </div>
                <div className="space-y-8 p-6">
                    {/* ロゴ + テナント名 */}
                    <div className="flex items-center gap-6">
                        <TenantLogo
                            logoUrl={tenant.logoUrl}
                            tenantName={tenant.tenantName}
                        />
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
                            <Badge
                                className={TENANT_STATUS_STYLE[tenant.tenantStatus] ?? ""}
                            >
                                {status}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                テナント種別
                            </span>
                            <Badge
                                className={TENANT_TYPE_STYLE[tenant.tenantType] ?? ""}
                            >
                                {type}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                店舗形態
                            </span>
                            <Badge
                                className={STORE_TYPE_STYLE[tenant.storeType] ?? ""}
                            >
                                {storeType}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                作成日時
                            </span>
                            <span className="text-base font-semibold text-slate-800">
                                {createdAt}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                作成者
                            </span>
                            <span className="font-mono text-base text-slate-800">
                                {tenant.createdByUserId ?? "不明"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                電話番号
                            </span>
                            <span className="text-base font-semibold text-slate-800">
                                {tenant.phoneNumber || "未設定"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-100 py-3">
                            <span className="text-base font-medium text-slate-500">
                                メールアドレス
                            </span>
                            <span className="text-base font-semibold text-slate-800">
                                {tenant.email || "未設定"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-base font-medium text-slate-500">
                                住所
                            </span>
                            <span className="text-base font-semibold text-slate-800">
                                {tenant.address || "未設定"}
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
