"use client";

import dynamic from "next/dynamic";
import * as React from "react";

type MapCoordinatePickerProps = {
    value: { lat: number; lng: number } | null;
    onChange: (value: { lat: number; lng: number } | null) => void;
};

const LeafletMap = dynamic(
    () => import("./MapInternal").then((mod) => mod.LeafletMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-64 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                地図を読み込み中…
            </div>
        ),
    },
);

export function MapCoordinatePicker({
    value,
    onChange,
}: MapCoordinatePickerProps) {
    return (
        <div className="space-y-2">
            <LeafletMap value={value} onChange={onChange} />
            <p className="text-xs text-muted-foreground">
                地図をクリックすると座標（緯度 / 経度）が更新されます。
            </p>
        </div>
    );
}
