"use client";

// Nominatim(OpenStreetMap) を使って緯度・経度から住所文字列を取得するユーティリティ関数
// lat, lng を受け取り、住所(display_name) を返します。取得に失敗した場合は Error を投げます。
export async function reverseGeocodeFromLatLng(
    lat: number,
    lng: number,
    options?: { signal?: AbortSignal },
): Promise<string> {
    const { signal } = options ?? {};

    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
            lat,
        )}&lon=${encodeURIComponent(lng)}&accept-language=ja`,
        {
            signal,
            headers: {
                // Nominatim は UA 推奨だが、ブラウザ制限があるため最低限のヘッダーに留める
                Accept: "application/json",
            },
        },
    );

    if (!res.ok) {
        throw new Error(`reverse geocode failed: ${res.status}`);
    }

    const data: { display_name?: string } = await res.json();

    if (!data.display_name) {
        throw new Error("住所を取得できませんでした");
    }

    return data.display_name;
}
