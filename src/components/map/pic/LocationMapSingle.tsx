"use client";

import { MapMarkersView } from "./MapMarkersView";
import type { StoreType } from "./MapMarkersView";

type Props = {
    lat: number;
    lng: number;
    type: StoreType;
};

export function LocationMapSingle({ lat, lng, type }: Props) {
    return (
        <MapMarkersView
            markers={[{ lat, lng, type }]}
            center={{ lat, lng }}
            zoom={15}
        />
    );
}
