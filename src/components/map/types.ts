/** 地図上で扱う座標（緯度・経度） */
export type Coordinate = { lat: number; lng: number } | null;

/** 店舗の形態（移動店舗 / 固定店舗）。ピン色分けに利用 */
export type StoreType = "fixed" | "mobile";

/** 地図上の1マーカーを表す項目 */
export type MarkerItem = {
    lat: number;
    lng: number;
    type?: StoreType;
    name?: string;
};
