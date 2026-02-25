"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L, { type LatLngBoundsExpression, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MarkerItem, StoreType } from "../types";

type Props = {
    markers: MarkerItem[];
    center?: { lat: number; lng: number };
    zoom: number;
    pinColors: Record<StoreType, string>;
    pinLabels: Record<StoreType, string>;
    className: string;
};

function createDivIcon(color: string): L.DivIcon {
    return L.divIcon({
        className: "custom-pin",
        html: `<div style="
          width: 24px;
          height: 24px;
          background: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

function BoundsFitter({ markers }: { markers: MarkerItem[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length === 0) return;
        if (markers.length === 1) {
            map.setView([markers[0].lat, markers[0].lng], 15);
            return;
        }
        const bounds: LatLngBoundsExpression = markers.map((m) => [
            m.lat,
            m.lng,
        ]) as LatLngBoundsExpression;
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }, [map, markers]);

    return null;
}

export function MapMultiPinInternal({
    markers,
    center,
    zoom,
    pinColors,
    pinLabels,
    className,
}: Props) {
    const defaultCenter: LatLngExpression =
        center ??
        (markers[0]
            ? [markers[0].lat, markers[0].lng]
            : [35.681236, 139.767125]);
    const iconCache = useMemo(() => {
        const cache: Record<StoreType, L.DivIcon> = {} as Record<
            StoreType,
            L.DivIcon
        >;
        (["fixed", "mobile"] as const).forEach((type) => {
            cache[type] = createDivIcon(pinColors[type]);
        });
        return cache;
    }, [pinColors]);

    if (markers.length === 0) {
        return (
            <div
                className={`bg-muted text-muted-foreground flex h-64 items-center justify-center rounded-md border text-sm ${className}`}
            >
                表示する場所がありません
            </div>
        );
    }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={zoom}
            minZoom={5}
            scrollWheelZoom
            className={`aspect-video w-full rounded-md border ${className}`}
        >
            <TileLayer
                attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>'
                url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
            />
            {!center && markers.length > 0 && (
                <BoundsFitter markers={markers} />
            )}
            {markers.map((m, i) => (
                <Marker
                    key={i}
                    position={[m.lat, m.lng] as LatLngExpression}
                    icon={iconCache[m.type]}
                >
                    <Popup>
                        <span className="font-medium">
                            {m.name ?? pinLabels[m.type]}
                        </span>
                        {m.name && (
                            <span className="text-muted-foreground ml-1 text-xs">
                                ({pinLabels[m.type]})
                            </span>
                        )}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
