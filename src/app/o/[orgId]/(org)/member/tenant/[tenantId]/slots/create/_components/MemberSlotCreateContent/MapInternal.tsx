"use client";

import * as React from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
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
    value: { lat: number; lng: number } | null;
    onChange: (value: { lat: number; lng: number } | null) => void;
};

function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

export function LeafletMap({ value, onChange }: Props) {
    // デフォルトは東京駅付近
    const center: LatLngExpression = value ?? [35.681236, 139.767125];

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            className="h-64 w-full rounded-md border"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onChange={onChange} />
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
