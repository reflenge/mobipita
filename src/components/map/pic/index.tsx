"use client";

// Leaflet を使った地図コンポーネントはブラウザ API に依存するため、
// Next.js の dynamic import でクライアント側のみで読み込む。
import dynamic from "next/dynamic";
import * as React from "react";

// 地図上で扱う座標（緯度・経度）の型
export type Coordinate = { lat: number; lng: number } | null;

// SSR を無効化した LeafletMap コンポーネント
// 読み込み中はプレースホルダーのボックスを表示する。
const LeafletMap = dynamic(
    () => import("./MapInternal").then((mod) => mod.LeafletMap),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-64 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                地図を読み込み中…
            </div>
        ),
    },
);

// コンテキストで共有する状態（現在の座標と更新ロジック）
type Store = {
    value: Coordinate;
    setValue: (v: Coordinate) => void;
    clear: () => void;
};

// MapCoordinatePicker 用のコンテキスト
const Ctx = React.createContext<Store | null>(null);

export function MapCoordinatePickerProvider({
    defaultValue = null,
    onChange,
    children,
}: {
    defaultValue?: Coordinate;
    onChange?: (v: Coordinate) => void;
    children: React.ReactNode;
}) {
    // 座標の内部状態。外から defaultValue を受け取りつつ、クリアもできる。
    const [value, _setValue] = React.useState<Coordinate>(defaultValue);

    const onChangeRef = React.useRef<typeof onChange>(onChange);
    // onChange は props が更新されるたびに ref に取り直し、
    // setValue 内から常に最新のコールバックを呼び出せるようにしている。
    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // 座標を更新しつつ、外部に onChange で変更を通知する関数
    const setValue = React.useCallback((v: Coordinate) => {
        _setValue(v);
        onChangeRef.current?.(v);
    }, []);

    // 座標を未選択状態（null）に戻すヘルパー
    const clear = React.useCallback(() => setValue(null), [setValue]);

    const store = React.useMemo(
        () => ({ value, setValue, clear }),
        [value, setValue, clear],
    );

    // 子コンポーネントから座標状態を参照・更新できるようにコンテキストで渡す
    return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

// MapCoordinatePicker 用のカスタムフック
// Provider の内側でのみ呼び出せるようにガードしている。
export function useMapCoordinatePicker() {
    const ctx = React.useContext(Ctx);
    if (!ctx) {
        throw new Error(
            "useMapCoordinatePicker は MapCoordinatePickerProvider の内側で使ってください。",
        );
    }
    return ctx;
}

// 実際の地図本体。コンテキストから座標と更新関数を取り出し、LeafletMap に委譲する。
function MapBody() {
    const { value, setValue } = useMapCoordinatePicker();
    return <LeafletMap value={value} onChange={setValue} />;
}

// 地図と説明テキスト、現在地ボタンをまとめた UI コンポーネント
// 単純に座標選択 UI を組み込みたいときはこのコンポーネントを使う。
export function MapCoordinatePicker() {

    return (
        <MapBody />
    );
}
