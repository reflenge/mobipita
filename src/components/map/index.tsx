"use client";

/**
 * 地図まわりコンポーネントのエントリポイント
 *
 * - single-pin: MapSinglePin（単一ピン表示）
 * - multi-pin: MapMultiPin（複数ピン表示）
 * - pin-locate-select: MapPinLocateSelect / Provider（地図クリックで座標選択）
 *
 * 後方互換のため MapCoordinatePicker / MapCoordinatePickerProvider もエクスポートしています。
 */

export type { Coordinate, StoreType, MarkerItem } from "./types";

export { MapSinglePin } from "./single-pin/MapSinglePin";
export type { MapSinglePinProps } from "./single-pin/MapSinglePin";

export { MapMultiPin } from "./multi-pin/MapMultiPin";
export type { MapMultiPinProps } from "./multi-pin/MapMultiPin";

export {
    MapPinLocateSelect,
    MapPinLocateSelectProvider,
    useMapPinLocateSelect,
} from "./pin-locate-select/MapPinLocateSelect";

// 後方互換
export {
    MapPinLocateSelect as MapCoordinatePicker,
    MapPinLocateSelectProvider as MapCoordinatePickerProvider,
} from "./pin-locate-select/MapPinLocateSelect";
export { useMapPinLocateSelect as useMapCoordinatePicker } from "./pin-locate-select/MapPinLocateSelect";
