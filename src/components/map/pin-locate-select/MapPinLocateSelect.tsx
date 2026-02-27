"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { Coordinate } from "../types";

const LeafletMap = dynamic(
    () => import("../MapInternal").then((mod) => mod.LeafletMap),
    {
        ssr: false,
        loading: () => (
            <div className="bg-muted text-muted-foreground flex h-64 items-center justify-center rounded-md border text-sm">
                地図を読み込み中…
            </div>
        ),
    },
);

type Store = {
    value: Coordinate;
    setValue: (v: Coordinate) => void;
    clear: () => void;
};

const Ctx = React.createContext<Store | null>(null);

/** ピン位置選択用の Provider。子に MapPinLocateSelect を配置する */
export function MapPinLocateSelectProvider({
    defaultValue = null,
    onChange,
    children,
}: {
    defaultValue?: Coordinate;
    onChange?: (v: Coordinate) => void;
    children: React.ReactNode;
}) {
    const [value, _setValue] = React.useState<Coordinate>(defaultValue);
    const onChangeRef = React.useRef(
        typeof onChange === "function" ? onChange : undefined,
    );
    React.useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const setValue = React.useCallback((v: Coordinate) => {
        _setValue(v);
        onChangeRef.current?.(v);
    }, []);

    const clear = React.useCallback(() => setValue(null), [setValue]);
    const store = React.useMemo(
        () => ({ value, setValue, clear }),
        [value, setValue, clear],
    );

    return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useMapPinLocateSelect(): Store {
    const ctx = React.useContext(Ctx);
    if (!ctx) {
        throw new Error(
            "useMapPinLocateSelect は MapPinLocateSelectProvider の内側で使ってください。",
        );
    }
    return ctx;
}

function MapPinLocateSelectBody() {
    const { value, setValue } = useMapPinLocateSelect();
    return <LeafletMap value={value} onChange={setValue} />;
}

/**
 * 地図をクリックして座標（緯度・経度）を選択するコンポーネント。
 * MapPinLocateSelectProvider の子として配置する。
 */
export function MapPinLocateSelect() {
    return <MapPinLocateSelectBody />;
}
