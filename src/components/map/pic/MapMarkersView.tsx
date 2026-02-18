"use client";

import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

export type StoreType = "fixed" | "mobile";

export type MarkerItem = {
    lat: number;
    lng: number;
    type: StoreType;
    name?: string;
};

const PIN_COLORS: Record<StoreType, string> = {
    fixed: "#2563eb", // blue-600
    mobile: "#ea580c", // orange-600
};

const PIN_LABELS: Record<StoreType, string> = {
    fixed: "固定店舗",
    mobile: "移動店舗",
};

const MapMarkersViewInternal = dynamic(
    () =>
        import("./MapMarkersViewInternal").then((mod) => mod.MapMarkersViewInternal),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-64 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                地図を読み込み中…
            </div>
        ),
    },
);

type Props = {
    markers: MarkerItem[];
    /** 初期表示の中心・ズーム。未指定時は全マーカーが入る範囲にフィット */
    center?: { lat: number; lng: number };
    zoom?: number;
    className?: string;
};

export function MapMarkersView({
    markers,
    center,
    zoom = 13,
    className = "",
}: Props) {
    return (
        <MapMarkersViewInternal
            markers={markers}
            center={center}
            zoom={zoom}
            pinColors={PIN_COLORS}
            pinLabels={PIN_LABELS}
            className={className}
        />
    );
}
