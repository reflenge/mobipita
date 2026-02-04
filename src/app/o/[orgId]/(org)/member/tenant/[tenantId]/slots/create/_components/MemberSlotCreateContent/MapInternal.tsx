"use client";

import * as React from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Next.js のバンドル環境だと Leaflet のデフォルトマーカー画像 URL 解決に失敗しやすいので、
// ここで明示的に画像 URL を設定する。
// 参考: https://github.com/PaulLeCam/react-leaflet/issues/453
const markerIcon2xUrl =
    typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src;
const markerIconUrl =
    typeof markerIcon === "string" ? markerIcon : markerIcon.src;
const markerShadowUrl =
    typeof markerShadow === "string" ? markerShadow : markerShadow.src;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2xUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
});

type Props = {
    /** 現在選択されている座標（緯度・経度）。nullの場合は未選択 */
    value: { lat: number; lng: number } | null;
    /** 座標が変更されたときに呼ばれるコールバック関数 */
    onChange: (value: { lat: number; lng: number } | null) => void;
};

/**
 * 地図上でクリックされた位置の座標を取得してonChangeを呼び出すコンポーネント
 * useMapEventsフックを使用して地図のクリックイベントを監視する
 */
function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

/**
 * 地図の中心位置を動的に更新するコンポーネント
 * MapContainerのcenterプロパティは初期レンダリング時のみ有効なため、
 * GPS座標が非同期で取得された後に地図の中心を更新するために必要
 * useMapフックで地図インスタンスにアクセスし、centerが変更されたらsetViewで更新する
 */
function MapCenterUpdater({
    center,
}: {
    center: LatLngExpression;
}) {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [map, center]);
    return null;
}

/**
 * Leafletを使用した地図コンポーネント
 * - ユーザーのGPS座標を取得して地図の初期位置として使用
 * - 地図上をクリックすることで座標を選択可能
 * - 選択された座標にはマーカーを表示
 */
export function LeafletMap({ value, onChange }: Props) {
    /** ユーザーの現在位置（GPS座標）を保持する状態 */
    const [gpsLocation, setGpsLocation] = React.useState<{
        lat: number;
        lng: number;
    } | null>(null);

    /**
     * コンポーネントマウント時にGPS座標を取得
     * ブラウザのGeolocation APIを使用して現在位置を取得する
     * ユーザーが位置情報の許可を拒否した場合や取得に失敗した場合はエラーをログに出力
     */
    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGpsLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn("GPS座標の取得に失敗しました:", error);
                }
            );
        }
    }, []);

    /**
     * 地図の中心座標を決定する優先順位:
     * 1. valueが設定されている場合 → 選択済みの座標を使用
     * 2. GPS座標が取得できた場合 → ユーザーの現在位置を使用
     * 3. どちらもない場合 → 東京駅の座標をフォールバックとして使用
     */
    const center: LatLngExpression = value
        ? [value.lat, value.lng]
        : gpsLocation
          ? [gpsLocation.lat, gpsLocation.lng]
          : [35.681236, 139.767125];

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            className="h-64 w-full rounded-md border"
        >
            {/* OpenStreetMapのタイルレイヤーを表示 */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* GPS座標が取得された後など、centerが変更されたときに地図の中心を更新 */}
            <MapCenterUpdater center={center} />
            {/* 地図上をクリックしたときに座標を選択するためのハンドラー */}
            <ClickHandler onChange={onChange} />
            {/* 選択された座標がある場合、その位置にマーカーを表示 */}
            {value && (
                <Marker position={[value.lat, value.lng] as LatLngExpression}>
                    <Popup>
                        緯度: {value.lat.toFixed(6)}
                        <br />
                        経度: {value.lng.toFixed(6)}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
