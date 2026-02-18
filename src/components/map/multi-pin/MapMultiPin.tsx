"use client";

import dynamic from "next/dynamic";
import type { MarkerItem, StoreType } from "../types";

const PIN_COLORS: Record<StoreType, string> = {
    fixed: "#2563eb", // blue-600
    mobile: "#ea580c", // orange-600
};

const PIN_LABELS: Record<StoreType, string> = {
    fixed: "固定店舗",
    mobile: "移動店舗",
};

const MapMultiPinInternal = dynamic(
    () =>
        import("./MapMultiPinInternal").then((mod) => mod.MapMultiPinInternal),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-64 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                地図を読み込み中…
            </div>
        ),
    },
);

/** 複数ピン表示用の props */
export type MapMultiPinProps = {
    markers: MarkerItem[];
    /** 初期表示の中心・ズーム。未指定時は全マーカーが入る範囲にフィット */
    center?: { lat: number; lng: number };
    zoom?: number;
    className?: string;
};

/**
 * 地図上に複数のピンを表示するコンポーネント。
 * 固定店舗＝青、移動店舗＝オレンジで色分けする。
 */
export function MapMultiPin({
    markers,
    center,
    zoom = 13,
    className = "",
}: MapMultiPinProps) {
    return (
        <MapMultiPinInternal
            markers={markers}
            center={center}
            zoom={zoom}
            pinColors={PIN_COLORS}
            pinLabels={PIN_LABELS}
            className={className}
        />
    );
}
