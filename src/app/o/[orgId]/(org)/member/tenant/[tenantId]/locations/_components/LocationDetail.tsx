"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/components/link";
import { LocationMapSingle } from "@/components/map/pic/LocationMapSingle";
import {
    MapCoordinatePicker,
    MapCoordinatePickerProvider,
} from "@/components/map/pic";
import { reverseGeocodeFromLatLng } from "@/components/map/pic/reverseGeocode";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import * as z from "zod";

const typeLabels: Record<string, string> = {
    fixed: "固定店舗",
    mobile: "移動店舗",
};

const formSchema = z.object({
    locations: z.object({
        type: z.enum(["fixed", "mobile"]),
        name: z
            .string()
            .min(1, "場所名を入力してください")
            .max(100, "場所名は100文字以内で入力してください"),
        address: z
            .string()
            .min(1, "住所を入力してください")
            .max(255, "住所は255文字以内で入力してください"),
        geo: z.object({
            lat: z.number(),
            lng: z.number(),
        }),
        details: z.string().max(1000, "詳細は1000文字以内で入力してください"),
    }),
});

type LocationDetailProps = {
    orgId: string;
    tenantId: string;
    locationId: string;
};

export function LocationDetail({
    orgId,
    tenantId,
    locationId,
}: LocationDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const location = useQuery(api.locations.getByIdInOrg, {
        clerkOrgId: orgId,
        locationId: locationId as Id<"Locations">,
    });
    const updateLocation = useMutation(api.locations.update);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            locations: {
                type: "fixed",
                name: "",
                address: "",
                geo: { lat: 35.6812, lng: 139.7671 },
                details: "",
            },
        },
        mode: "all",
    });

    const geoValue = form.watch("locations.geo");

    useEffect(() => {
        if (location && isEditing) {
            form.reset({
                locations: {
                    type: location.type,
                    name: location.name,
                    address: location.address,
                    geo: { lat: location.lat, lng: location.lng },
                    details: location.details ?? "",
                },
            });
        }
    }, [location, isEditing, form]);

    const handleMapChange = useCallback(
        (v: { lat: number; lng: number } | null) => {
            if (!v) return;
            form.setValue("locations.geo", v, { shouldValidate: true });
            reverseGeocodeFromLatLng(v.lat, v.lng)
                .then((address) => {
                    form.setValue("locations.address", address, {
                        shouldValidate: true,
                    });
                })
                .catch(() => {});
        },
        [form],
    );

    function onSubmit(data: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await updateLocation({
                    clerkOrgId: orgId,
                    locationId: locationId as Id<"Locations">,
                    type: data.locations.type,
                    name: data.locations.name,
                    address: data.locations.address,
                    lat: data.locations.geo.lat,
                    lng: data.locations.geo.lng,
                    details: data.locations.details,
                });
                toast.success("場所を更新しました");
                setIsEditing(false);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "場所の更新に失敗しました",
                );
            }
        });
    }

    if (location === undefined) {
        return (
            <Card>
                <CardHeader className="gap-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (location === null) {
        return (
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>場所が見つかりません</CardTitle>
                    <CardDescription>
                        指定された場所は存在しないか、アクセスできません。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link
                        href={`/o/${orgId}/member/tenant/${tenantId}/locations`}
                    >
                        <Button variant="outline">場所一覧へ</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const type = typeLabels[location.type] ?? "不明";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;

    if (isEditing) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle>場所を編集</CardTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                    >
                        キャンセル
                    </Button>
                </CardHeader>
                <CardContent>
                    <form
                        id="form-location-edit"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FieldGroup className="space-y-4">
                            <Controller
                                name="locations.type"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>種別</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                aria-invalid={fieldState.invalid}
                                                className="w-full max-w-xs"
                                            >
                                                <SelectValue placeholder="種別を選択" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">
                                                    固定店舗
                                                </SelectItem>
                                                <SelectItem value="mobile">
                                                    移動店舗
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="locations.name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>店舗名（場所名）</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="例: カフェ高知駅前店"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="locations.address"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>住所</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="地図でピンを立てるか、直接入力"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                            <Field>
                                <FieldLabel>地図で位置を選択</FieldLabel>
                                <p className="text-sm text-muted-foreground mb-2">
                                    地図をクリックすると座標が設定され、住所が自動で入ります。
                                </p>
                                <MapCoordinatePickerProvider
                                    defaultValue={geoValue}
                                    onChange={handleMapChange}
                                >
                                    <MapCoordinatePicker />
                                </MapCoordinatePickerProvider>
                            </Field>
                            <Controller
                                name="locations.details"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>詳細・備考</FieldLabel>
                                        <Textarea
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="例: 入口は北側。駐車場2台分あり。"
                                            rows={3}
                                            className="resize-none"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError
                                                errors={[fieldState.error]}
                                            />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                        <Field orientation="horizontal" className="gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="submit"
                                form="form-location-edit"
                                disabled={isPending}
                            >
                                {isPending ? "保存中..." : "保存する"}
                            </Button>
                        </Field>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-2xl">
                            {location.name}
                        </CardTitle>
                        <Badge variant="secondary">{type}</Badge>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                    >
                        編集
                    </Button>
                </div>
                <CardDescription>{location.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        地図
                    </h3>
                    <LocationMapSingle
                        lat={location.lat}
                        lng={location.lng}
                        type={location.type}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">緯度</span>
                    <span className="font-mono">{location.lat}</span>
                    <span className="text-muted-foreground">経度</span>
                    <span className="font-mono">{location.lng}</span>
                </div>
                <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary underline hover:no-underline text-sm"
                >
                    Google Mapsで開く
                </a>
                {location.details && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                        {location.details}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
