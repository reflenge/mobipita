"use client";

import { useCallback, useTransition } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import Tiptap from "@/components/Tiptap";
import {
    MapPinLocateSelect,
    MapPinLocateSelectProvider,
} from "@/components/map";
import { reverseGeocodeFromLatLng } from "@/components/map/reverseGeocode";
import CreateLocationSkeleton from "./createLocationSkeleton";

const formSchema = z.object({
    locations: z.object({
        tenantId: z.string(),
        type: z.enum(["fixed", "mobile"]),
        name: z
            .string()
            .min(1, "場所名を入力してください")
            .max(100, "場所名は100文字以内で入力してください"),
        autoAddress: z.string().max(255, "住所は255文字以内で入力してください"),
        semiAddress: z
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

const DEFAULT_GEO = { lat: 35.6812, lng: 139.7671 } as const; // 東京

type Props = {
    tenantId: string;
};

export function CreateLocation({ tenantId }: Props) {
    const router = useRouter();
    const tenant = useQuery(api.tenants.getById, {
        tenantId: tenantId as Id<"Tenants">,
    });
    const createLocation = useMutation(api.locations.create);
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            locations: {
                tenantId,
                type: "fixed",
                name: "",
                autoAddress: "",
                semiAddress: "",
                geo: { ...DEFAULT_GEO },
                details: "<p></p>",
            },
        },
        mode: "all",
    });

    const geoValue = form.watch("locations.geo");

    const handleMapChange = useCallback(
        (v: { lat: number; lng: number } | null) => {
            if (!v) return;
            form.setValue("locations.geo", v, { shouldValidate: true });
            reverseGeocodeFromLatLng(v.lat, v.lng)
                .then((addr) => {
                    form.setValue("locations.autoAddress", addr, {
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
                await createLocation({
                    tenantId: data.locations.tenantId as Id<"Tenants">,
                    type: data.locations.type,
                    name: data.locations.name,
                    autoAddress: data.locations.autoAddress,
                    semiAddress: data.locations.semiAddress,
                    lat: data.locations.geo.lat,
                    lng: data.locations.geo.lng,
                    details: data.locations.details,
                });
                toast.success("場所を作成しました");
                router.push(`/staff/tenant/${tenantId}/locations`);
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "場所の作成に失敗しました",
                );
            }
        });
    }

    if (!tenant) {
        return <CreateLocationSkeleton />;
    }

    return (
        <div className="container mx-auto space-y-6 px-6 py-10">
            <div>
                <div className="text-xl">場所作成</div>
                <p className="text-muted-foreground text-sm">
                    {tenant.tenantName} {tenant._id} の場所を新規作成します
                </p>
            </div>

            <form
                id="form-location-create"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <FieldGroup className="space-y-4">
                    <input
                        type="hidden"
                        {...form.register("locations.tenantId")}
                    />

                    <Controller
                        name="locations.type"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-location-create-type">
                                    種別
                                </FieldLabel>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        id="form-location-create-type"
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
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="locations.name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-location-create-name">
                                    店舗名(場所名)
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-location-create-name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="例: カフェ高知駅前店"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="locations.autoAddress"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-location-create-autoAddress">
                                    住所（自動取得）
                                </FieldLabel>
                                <Input
                                    value={field.value}
                                    id="form-location-create-autoAddress"
                                    readOnly
                                    tabIndex={-1}
                                    className="bg-muted cursor-not-allowed"
                                    placeholder="地図をクリックすると自動で入ります"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Controller
                        name="locations.semiAddress"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-location-create-semiAddress">
                                    住所（正式）
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-location-create-semiAddress"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="例: 東京都千代田区丸の内1-1-1"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />

                    <Field>
                        <FieldLabel>地図で位置を選択</FieldLabel>
                        <p className="text-muted-foreground mb-2 text-sm">
                            地図をクリックすると座標が設定され、住所が自動で入ります。
                        </p>
                        <MapPinLocateSelectProvider
                            defaultValue={geoValue}
                            onChange={handleMapChange}
                        >
                            <MapPinLocateSelect />
                        </MapPinLocateSelectProvider>
                    </Field>

                    <Controller
                        name="locations.details"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-location-create-details">
                                    詳細・備考
                                </FieldLabel>
                                <Tiptap
                                    sentence={field.value}
                                    setSentence={field.onChange}
                                    onBlur={field.onBlur}
                                    maxLength={1000}
                                    id="form-location-create-details"
                                    aria-invalid={fieldState.invalid}
                                    className="max-h-96 min-h-32 w-full overflow-y-auto"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>

                <Field orientation="horizontal" className="gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        form="form-location-create"
                        disabled={isPending}
                    >
                        {isPending ? "作成中..." : "作成する"}
                    </Button>
                </Field>
            </form>
        </div>
    );
}
