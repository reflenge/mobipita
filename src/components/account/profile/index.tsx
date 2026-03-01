"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { Pencil, Save, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/../convex/_generated/api";
import { Link } from "@/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { GENDER_LABELS, type ProfileMeta } from "@/lib/profile";

import type { AccountPageProps } from "..";
import { AccountProfileEdit } from "./edit";

export function AccountProfile({ basePath, segments }: AccountPageProps) {
    if (segments[0] === "edit") {
        return <AccountProfileEdit basePath={basePath} />;
    }

    const { user, isLoaded } = useUser();
    const profile = useQuery(api.userProfiles.getMyProfile);
    const updateMemo = useMutation(api.userProfiles.updateCustomerMemo);

    const [memo, setMemo] = React.useState("");
    const [memoInitialized, setMemoInitialized] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (profile && !memoInitialized) {
            setMemo(profile.customerMemo);
            setMemoInitialized(true);
        }
    }, [profile, memoInitialized]);

    if (!isLoaded || profile === undefined) {
        return (
            <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    if (!user) return null;

    const meta = (user.unsafeMetadata ?? {}) as ProfileMeta;
    const initials =
        `${user.lastName ?? ""}${user.firstName ?? ""}`
            .slice(0, 2)
            .toUpperCase() || "?";

    const isDirty = memo !== (profile?.customerMemo ?? "");

    async function handleSaveMemo() {
        setSaving(true);
        try {
            await updateMemo({ customerMemo: memo });
            toast.success("メモを保存しました");
        } catch {
            toast.error("メモの保存に失敗しました");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">
                    プロフィール
                </h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`${basePath}/profile/edit`}>
                        <Pencil className="size-4" />
                        編集
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <Avatar className="size-12">
                            <AvatarImage
                                src={user.imageUrl}
                                alt={user.fullName ?? ""}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-semibold">
                                {user.lastName} {user.firstName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {user.emailAddresses[0]?.emailAddress}
                            </p>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        ※GoogleやLINEでログインした直後は、連携元の名前がそのまま登録されています。
                        <br />
                        正しいお名前に変更してください。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <InfoRow
                        label="性別"
                        value={
                            meta.gender ? GENDER_LABELS[meta.gender] : "未設定"
                        }
                    />
                    <InfoRow
                        label="生年月日"
                        value={meta.birthday ?? "未設定"}
                    />
                    <InfoRow label="電話番号" value={meta.phone ?? "未設定"} />
                    {meta.address ? (
                        <InfoRow
                            label="住所"
                            value={`〒${meta.address.postalCode} ${meta.address.prefecture}${meta.address.city}${meta.address.line}`}
                        />
                    ) : (
                        <InfoRow label="住所" value="未設定" />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="size-4" />
                        自分用メモ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="アレルギーや注意事項など、自由にメモを残せます"
                        rows={4}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-xs">
                            このメモはスタッフにも共有されます
                        </p>
                        <Button
                            size="sm"
                            disabled={!isDirty || saving}
                            onClick={handleSaveMemo}
                        >
                            <Save className="size-4" />
                            保存
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    const isUnset = value === "未設定";
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={isUnset ? "text-muted-foreground/50" : ""}>
                {value}
            </span>
        </div>
    );
}
