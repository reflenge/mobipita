"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { MapMarkersView } from "@/components/map/pic/MapMarkersView";
import type { MarkerItem } from "@/components/map/pic/MapMarkersView";

type LocationsMapProps = {
    tenantId: string;
};

export function LocationsMap({ tenantId }: LocationsMapProps) {
    const locations = useQuery(api.locations.listByTenant, {
        tenantId: tenantId as Id<"Tenants">,
        limit: 50,
    });

    if (!locations || locations.length === 0) {
        return null;
    }

    const markers: MarkerItem[] = locations.map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
        type: loc.type,
        name: loc.name,
    }));

    return (
        <section className="space-y-2">
            <h2 className="text-lg font-semibold">地図</h2>
            <p className="text-sm text-muted-foreground">
                青＝固定店舗、オレンジ＝移動店舗
            </p>
            <MapMarkersView markers={markers} />
        </section>
    );
}
