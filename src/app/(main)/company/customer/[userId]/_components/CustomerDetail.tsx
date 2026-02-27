"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Tag, MessageSquare, User, ArrowLeft } from "lucide-react";
import { Link } from "@/components/link";
import { GENDER_LABELS, type ProfileAddress } from "@/lib/profile";

type UserInfo = {
    userId: string;
    displayName: string;
    email: string;
    imageUrl: string | null;
    firstName: string;
    lastName: string;
    gender?: string;
    birthday?: string;
    phone?: string;
    address?: ProfileAddress;
};

export function CustomerDetail({ user }: { user: UserInfo }) {
    const profile = useQuery(api.userProfiles.getByUserId, {
        clerkUserId: user.userId,
    });
    const allTags = useQuery(api.staffTags.list);
    const updateStaffMemo = useMutation(api.userProfiles.updateStaffMemo);
    const setStaffTags = useMutation(api.userProfiles.setStaffTags);

    const [staffMemo, setStaffMemo] = React.useState("");
    const [memoInit, setMemoInit] = React.useState(false);
    const [memoSaving, setMemoSaving] = React.useState(false);

    const [selectedTags, setSelectedTags] = React.useState<Set<string>>(
        new Set(),
    );
    const [tagsInit, setTagsInit] = React.useState(false);
    const [tagsSaving, setTagsSaving] = React.useState(false);

    React.useEffect(() => {
        if (profile && !memoInit) {
            setStaffMemo(profile.staffMemo);
            setMemoInit(true);
        }
    }, [profile, memoInit]);

    React.useEffect(() => {
        if (profile && !tagsInit) {
            setSelectedTags(new Set(profile.staffTags));
            setTagsInit(true);
        }
    }, [profile, tagsInit]);

    const isLoading = profile === undefined || allTags === undefined;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    const memoDirty = staffMemo !== (profile?.staffMemo ?? "");

    const currentTagSet = new Set(profile?.staffTags ?? []);
    const tagsDirty =
        selectedTags.size !== currentTagSet.size ||
        [...selectedTags].some((t) => !currentTagSet.has(t));

    async function handleSaveMemo() {
        setMemoSaving(true);
        try {
            await updateStaffMemo({
                clerkUserId: user.userId,
                staffMemo,
            });
            toast.success("スタッフメモを保存しました");
        } catch {
            toast.error("保存に失敗しました");
        } finally {
            setMemoSaving(false);
        }
    }

    async function handleSaveTags() {
        setTagsSaving(true);
        try {
            await setStaffTags({
                clerkUserId: user.userId,
                tagIds: Array.from(selectedTags) as Id<"StaffTags">[],
            });
            toast.success("タグを保存しました");
        } catch {
            toast.error("タグの保存に失敗しました");
        } finally {
            setTagsSaving(false);
        }
    }

    function toggleTag(tagId: string) {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tagId)) {
                next.delete(tagId);
            } else {
                next.add(tagId);
            }
            return next;
        });
    }

    const initials =
        user.displayName.slice(0, 2).toUpperCase() || "?";

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/company/employee">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">
                    顧客詳細
                </h1>
            </div>

            {/* 基本情報 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-base">
                        <Avatar className="size-12">
                            <AvatarImage
                                src={user.imageUrl ?? ""}
                                alt={user.displayName}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-semibold">
                                {user.displayName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {user.email}
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <Row label="性別" value={user.gender ? (GENDER_LABELS[user.gender] ?? user.gender) : "未設定"} />
                    <Row label="生年月日" value={user.birthday ?? "未設定"} />
                    <Row label="電話番号" value={user.phone ?? "未設定"} />
                    {user.address ? (
                        <Row
                            label="住所"
                            value={`〒${user.address.postalCode} ${user.address.prefecture}${user.address.city}${user.address.line}`}
                        />
                    ) : (
                        <Row label="住所" value="未設定" />
                    )}
                </CardContent>
            </Card>

            {/* 顧客メモ（読み取り専用） */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="size-4" />
                        顧客メモ（本人記入）
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground bg-muted/50 min-h-[4rem] whitespace-pre-wrap rounded-md p-3 text-sm">
                        {profile?.customerMemo || "メモなし"}
                    </p>
                </CardContent>
            </Card>

            {/* スタッフメモ */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="size-4" />
                        スタッフメモ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Textarea
                        value={staffMemo}
                        onChange={(e) => setStaffMemo(e.target.value)}
                        placeholder="スタッフ間で共有するメモ（顧客には表示されません）"
                        rows={4}
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            disabled={!memoDirty || memoSaving}
                            onClick={handleSaveMemo}
                        >
                            <Save className="size-4" />
                            保存
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* スタッフタグ */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Tag className="size-4" />
                        タグ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {allTags && allTags.length > 0 ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {allTags.map((tag) => (
                                <label
                                    key={tag._id}
                                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors select-none hover:bg-accent/50"
                                >
                                    <Checkbox
                                        checked={selectedTags.has(tag._id)}
                                        onCheckedChange={() =>
                                            toggleTag(tag._id)
                                        }
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {tag.title}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {tag.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            タグが定義されていません。会社管理 &gt; タグ管理から作成してください。
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                            {allTags
                                ?.filter((t) => selectedTags.has(t._id))
                                .map((t) => (
                                    <Badge
                                        key={t._id}
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {t.title}
                                    </Badge>
                                ))}
                        </div>
                        <Button
                            size="sm"
                            disabled={!tagsDirty || tagsSaving}
                            onClick={handleSaveTags}
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

function Row({ label, value }: { label: string; value: string }) {
    const isUnset = value === "未設定" || value === "メモなし";
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className={isUnset ? "text-muted-foreground/50" : ""}>
                {value}
            </span>
        </div>
    );
}
