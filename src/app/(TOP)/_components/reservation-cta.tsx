"use client";

import { Link } from "@/components/link";
import Image from "next/image";
import handImage from "./hand.png";
import "./reservation-cta.css";
export function ReservationCta() {
    return (
        <div className="flex flex-col gap-8">
            <p className="text-muted-foreground text-center text-base leading-relaxed sm:text-lg">
                <strong className="text-foreground font-bold">
                    日時・場所・サービス
                </strong>
                を選んで、
                <strong className="text-foreground font-bold">
                    予約
                </strong>
                できます。
                <br className="hidden sm:inline" />
                <strong className="text-foreground font-bold">
                    下のボタン
                </strong>
                を押すと
                <strong className="text-foreground font-bold">
                    予約の画面
                </strong>
                に進みます。
            </p>

            {/* 手とボタンを横並びで、文字と画像が被らないように */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 group">
                <Link
                    href="/reserve/tenant"
                    className="reservation-cta-tap-hand order-2 shrink-0 sm:order-1 flex items-center justify-center"
                    aria-label="ここから予約"
                >
                    <Image
                        src={handImage}
                        alt=""
                        width={80}
                        height={96}
                        className="h-20 w-auto rotate-0 sm:h-24 sm:rotate-90"
                    />
                </Link>
                <Link
                    href="/reserve/tenant"
                    className="reservation-cta-button bg-foreground text-background hover:bg-foreground/90 order-1 flex w-full max-w-md shrink-0 items-center justify-center gap-3 rounded-2xl px-8 py-6 text-xl font-bold shadow-lg transition hover:scale-[1.03] active:scale-[0.98] sm:order-2 sm:py-8 sm:text-2xl md:text-3xl group-hover:bg-foreground/90 group-hover:scale-[1.03]"
                >
                    <span>ここから予約</span>
                </Link>
            </div>
        </div>
    );
}
