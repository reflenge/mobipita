"use client";

import { MapMultiPin } from "../multi-pin/MapMultiPin";
import type { StoreType } from "../types";

/** 単一ピン表示用の props */
export type MapSinglePinProps = {
    lat: number;
    lng: number;
    /** ピン色の種別（固定=青・移動=オレンジ）。未指定時は fixed */
    type?: StoreType;
    zoom?: number;
    className?: string;
};

/**
 * 地図上に1つのピンを表示するコンポーネント。
 * 場所詳細など、単一点の表示に利用する。
 */
export function MapSinglePin({
    lat,
    lng,
    type = "fixed",
    zoom = 15,
    className,
}: MapSinglePinProps) {
    return (
        <MapMultiPin
            markers={[{ lat, lng, type }]}
            center={{ lat, lng }}
            zoom={zoom}
            className={className ?? ""}
        />
    );
}
