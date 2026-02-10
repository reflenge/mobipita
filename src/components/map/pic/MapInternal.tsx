"use client";

// React から Leaflet（地図ライブラリ）を扱うためのコンポーネント群をインポート
import { useCallback, useEffect, useRef, useState } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L, { type ControlPosition, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import { createRoot } from "react-dom/client";
// Leaflet のデフォルトマーカー画像（通常・2x・影）をインポート
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { reverseGeocodeFromLatLng } from "./reverseGeocode";

// Next.js のバンドル環境だと Leaflet のデフォルトマーカー画像 URL 解決に失敗しやすいので、
// ここで明示的に画像 URL を設定する。
// 参考: https://github.com/PaulLeCam/react-leaflet/issues/453
// 画像のインポート結果が string かオブジェクトか環境によって異なるので、
// どちらにも対応できるように URL を正規化している。
const markerIcon2xUrl =
    typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src;
const markerIconUrl =
    typeof markerIcon === "string" ? markerIcon : markerIcon.src;
const markerShadowUrl =
    typeof markerShadow === "string" ? markerShadow : markerShadow.src;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 既存のデフォルトアイコン設定を削除してから、
// 上で定義した URL を用いてマーカーの見た目を上書きする。
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2xUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
});

// 地図コンポーネントに渡す座標と変更ハンドラーの props
type Props = {
    value: { lat: number; lng: number } | null;
    onChange: (value: { lat: number; lng: number } | null) => void;
};

// 地図上のクリックイベントを拾い、クリックされた位置の座標を親側に通知するための補助コンポーネント
function ClickHandler({ onChange }: { onChange: Props["onChange"] }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

// 外部から渡された座標 value が変わったときに、地図の中心位置も追従させるためのコンポーネント
function CenterUpdater({ value }: { value: Props["value"] }) {
    const map = useMap();

    if (value) {
        // value が存在する場合、その座標を中心にズームレベルを維持したままビューを移動する
        map.setView([value.lat, value.lng]);
    }

    return null;
}

function CurrentLocationButton({
    position,
    onChange,
}: {
    position: ControlPosition;
    onChange: Props["onChange"];
}) {
    const map = useMap();
    useEffect(() => {
        let iconRoot: ReturnType<typeof createRoot> | null = null;

        const CustomButton = L.Control.extend({
            options: {
                position,
            },
            onAdd: function () {
                const button = L.DomUtil.create(
                    "button",
                    "leaflet-bar leaflet-control leaflet-control-custom"
                ) as HTMLButtonElement;
                button.type = "button";
                button.className = "customButton";
                button.style.padding = "4px";
                button.style.backgroundColor = "white";
                button.style.border = "2px solid #0003";
                button.style.borderRadius = "4px";
                button.style.cursor = "pointer";
                button.style.backgroundClip = "padding-box";

                const iconContainer = L.DomUtil.create("span", "", button);
                iconContainer.className = "currentPositionIcon";
                iconRoot = createRoot(iconContainer);
                iconRoot.render(<LocateFixed className="" />);

                L.DomEvent.disableClickPropagation(button);
                L.DomEvent.disableScrollPropagation(button);

                button.onclick = () => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (location) => {
                                onChange({
                                    lat: location.coords.latitude,
                                    lng: location.coords.longitude,
                                });
                            },
                            (err) => {
                                console.log(err);
                            }
                        );
                    } else {
                        console.log("ブラウザが対応していません");
                    }
                };

                return button;
            },
            onRemove: function () {
                const root = iconRoot;
                iconRoot = null;
                if (root) {
                    queueMicrotask(() => {
                        root.unmount();
                    });
                }
            },
        });

        const control = new CustomButton();
        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map, onChange, position]);

    return null;
}

function MapCenterDisplay({ position }: { position: ControlPosition }) {
    const map = useMap();
    useEffect(() => {
        let updateText: (() => void) | null = null;
        const Control = L.Control.extend({
            options: { position },
            onAdd: function () {
                const container = L.DomUtil.create(
                    "div",
                    "leaflet-bar leaflet-control"
                ) as HTMLDivElement;
                container.className = "centerCoordinate";
                container.style.margin = "0";
                // container.style.padding = "4px 8px";
                // container.style.background = "rgba(255, 255, 255, 0.9)";

                updateText = () => {
                    const center = map.getCenter();
                    container.textContent = `${center.lat.toFixed(
                        6
                    )}, ${center.lng.toFixed(6)}`;
                };

                updateText();
                map.on("moveend", updateText);

                return container;
            },
        });

        const control = new Control();
        map.addControl(control);

        return () => {
            map.removeControl(control);
            if (updateText) {
                map.off("moveend", updateText);
            }
        };
    }, [map, position]);

    return null;
}

// 実際に Leaflet の地図を描画するコンポーネント
// 外部から渡された座標を中心に表示し、クリックで座標を更新できる。
export function LeafletMap({ value, onChange }: Props) {
    // 座標が未設定の場合は東京駅付近を中心として表示する
    const fallbackCenter = { lat: 35.681236, lng: 139.767125 };
    const initialCenter = value ?? fallbackCenter;
    const center: LatLngExpression = [initialCenter.lat, initialCenter.lng];
    const markerRef = useRef<L.Marker | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [addressError, setAddressError] = useState<string | null>(null);

    const handleMarkerRef = useCallback(
        (node: L.Marker | null) => {
            markerRef.current = node;
            if (node && value) {
                node.openPopup();
            }
        },
        [value]
    );

    useEffect(() => {
        if (!value) {
            setAddress(null);
            setAddressError(null);
            return;
        }

        const controller = new AbortController();
        setAddress(null);
        setAddressError(null);

        reverseGeocodeFromLatLng(value.lat, value.lng, {
            signal: controller.signal,
        })
            .then((result) => {
                setAddress(result);
            })
            .catch((err: unknown) => {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }
                console.error(err);
                setAddressError("住所取得に失敗しました");
            });

        return () => {
            controller.abort();
        };
    }, [value]);

    return (
        // MapContainer が Leaflet の地図本体。スクロールや拡大縮小を有効化している。
        <MapContainer
            center={center}
            zoom={13}
            minZoom={5}
            scrollWheelZoom={true}
            className="w-full aspect-video rounded-md border"
        >
            {/* OpenStreetMap のタイル（地図タイル画像）を読み込むレイヤー */}
            <TileLayer
                attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>'
                url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
            />
            {/* <TileLayer
                attribution=''
                url="https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"
            /> */}
            {/* クリックイベントを拾い、座標変更をコールバック経由で通知 */}
            <ClickHandler onChange={onChange} />
            {/* value の変更に応じて地図の中心位置を更新する */}
            <CenterUpdater value={value} />
            <CurrentLocationButton position="bottomleft" onChange={onChange} />
            <MapCenterDisplay position="topright" />
            {value && (
                // value がある場合のみ、その位置にマーカーとポップアップを表示する
                <Marker
                    ref={handleMarkerRef}
                    position={[value.lat, value.lng] as LatLngExpression}
                >
                    <Popup>
                        {addressError
                            ? addressError
                            : address ?? "住所取得中..."}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
