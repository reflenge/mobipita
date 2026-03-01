"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { Save, ArrowLeft, CalendarIcon, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    GENDER_LABELS,
    PREFECTURES,
    type ProfileMeta,
    type ProfileAddress,
} from "@/lib/profile";
import { cn } from "@/lib/utils";

interface AccountProfileEditProps {
    basePath: string;
}

export function AccountProfileEdit({ basePath }: AccountProfileEditProps) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [saving, setSaving] = React.useState(false);
    const [searching, setSearching] = React.useState(false);

    const [lastName, setLastName] = React.useState("");
    const [firstName, setFirstName] = React.useState("");
    const [gender, setGender] = React.useState("");
    const [birthday, setBirthday] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [postalCode, setPostalCode] = React.useState("");
    const [prefecture, setPrefecture] = React.useState("");
    const [city, setCity] = React.useState("");
    const [line, setLine] = React.useState("");

    const [initialized, setInitialized] = React.useState(false);

    React.useEffect(() => {
        if (isLoaded && user && !initialized) {
            const meta = (user.unsafeMetadata ?? {}) as ProfileMeta;
            setLastName(user.lastName ?? "");
            setFirstName(user.firstName ?? "");
            setGender(meta.gender ?? "");
            setBirthday(meta.birthday ?? "");
            setPhone(meta.phone ?? "");
            setPostalCode(meta.address?.postalCode ?? "");
            setPrefecture(meta.address?.prefecture ?? "");
            setCity(meta.address?.city ?? "");
            setLine(meta.address?.line ?? "");
            setInitialized(true);
        }
    }, [isLoaded, user, initialized]);

    if (!isLoaded || !initialized) {
        return (
            <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    if (!user) return null;

    function toHalfWidthDigits(s: string): string {
        return s
            .replace(/[０-９]/g, (ch) =>
                String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
            )
            .replace(/[^0-9]/g, "");
    }

    async function handleSearchAddress() {
        const digits = toHalfWidthDigits(postalCode);
        if (digits.length !== 7) {
            toast.error("郵便番号は7桁で入力してください");
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(
                `https://api.zipaddress.net/?zipcode=${digits}`,
            );
            const json = await res.json();
            if (json.code !== 200 || !json.data) {
                toast.error("住所が見つかりませんでした");
                return;
            }
            setPrefecture(json.data.pref ?? "");
            setCity(`${json.data.city ?? ""}${json.data.town ?? ""}`);
            toast.success("住所を取得しました");
        } catch {
            toast.error("住所検索に失敗しました");
        } finally {
            setSearching(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const normalizedPhone = toHalfWidthDigits(phone);
        const normalizedPostalCode = toHalfWidthDigits(postalCode);

        const address: ProfileAddress | undefined =
            normalizedPostalCode || prefecture || city || line
                ? { postalCode: normalizedPostalCode, prefecture, city, line }
                : undefined;

        const newMeta: ProfileMeta = {
            ...(user!.unsafeMetadata as ProfileMeta),
            gender: (gender || undefined) as ProfileMeta["gender"],
            birthday: birthday || undefined,
            phone: normalizedPhone || undefined,
            address,
        };

        try {
            await user!.update({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                unsafeMetadata: newMeta,
            });
            toast.success("プロフィールを更新しました");
            router.push(`${basePath}/profile`);
        } catch {
            toast.error("プロフィールの更新に失敗しました");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`${basePath}/profile`}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold tracking-tight">
                    プロフィール編集
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">基本情報</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="lastName">姓</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(e.target.value)
                                    }
                                    placeholder="山田"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">名</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(e.target.value)
                                    }
                                    placeholder="太郎"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="gender">性別</Label>
                                <Select
                                    value={gender}
                                    onValueChange={setGender}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(GENDER_LABELS).map(
                                            ([value, label]) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>生年月日</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !birthday &&
                                                    "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="size-4" />
                                            {birthday
                                                ? new Date(
                                                      birthday + "T00:00:00",
                                                  ).toLocaleDateString(
                                                      "ja-JP",
                                                      {
                                                          year: "numeric",
                                                          month: "long",
                                                          day: "numeric",
                                                      },
                                                  )
                                                : "選択してください"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={
                                                birthday
                                                    ? new Date(
                                                          birthday +
                                                              "T00:00:00",
                                                      )
                                                    : undefined
                                            }
                                            onSelect={(date) => {
                                                if (date) {
                                                    const y =
                                                        date.getFullYear();
                                                    const m = String(
                                                        date.getMonth() + 1,
                                                    ).padStart(2, "0");
                                                    const d = String(
                                                        date.getDate(),
                                                    ).padStart(2, "0");
                                                    setBirthday(
                                                        `${y}-${m}-${d}`,
                                                    );
                                                } else {
                                                    setBirthday("");
                                                }
                                            }}
                                            captionLayout="dropdown"
                                            fromYear={1920}
                                            toYear={new Date().getFullYear()}
                                            defaultMonth={
                                                birthday
                                                    ? new Date(
                                                          birthday +
                                                              "T00:00:00",
                                                      )
                                                    : new Date(2000, 0)
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">電話番号</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="090-1234-5678"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className="text-base">住所</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">郵便番号</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="postalCode"
                                        value={postalCode}
                                        onChange={(e) =>
                                            setPostalCode(e.target.value)
                                        }
                                        placeholder="100-0001"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={searching}
                                        onClick={handleSearchAddress}
                                        title="郵便番号から住所検索"
                                    >
                                        {searching ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Search className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prefecture">都道府県</Label>
                                <Select
                                    value={prefecture}
                                    onValueChange={setPrefecture}
                                >
                                    <SelectTrigger id="prefecture">
                                        <SelectValue placeholder="選択してください" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PREFECTURES.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">市区町村</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="千代田区千代田"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="line">番地・建物名</Label>
                            <Input
                                id="line"
                                value={line}
                                onChange={(e) => setLine(e.target.value)}
                                placeholder="1-1 ○○マンション 101号室"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={saving}>
                        <Save className="size-4" />
                        {saving ? "保存中..." : "保存する"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
