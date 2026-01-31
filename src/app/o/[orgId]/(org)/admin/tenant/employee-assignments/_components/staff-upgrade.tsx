import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { Settings, Menu } from "lucide-react";
import Image from "next/image";
import OrganizationSwitcherImage from "../_assets/OrganizationSwitcher.png";
import OrganizationProfileImage from "../_assets/OrganizationProfile.png";

export const StaffUpgrade = () => {
    return (
        <section>
            <h1 className="text-2xl font-semibold">
                Customer から従業員へ昇格する
            </h1>
            <ul className="list-decimal space-y-2 pl-4">
                <li>
                    <div className="flex flex-wrap items-center gap-1">
                        <span>このドロップダウン</span>
                        <OrganizationSwitcher hidePersonal={true} defaultOpen />
                        <span>を開く</span>
                    </div>
                </li>
                <li>
                    <div className="flex flex-wrap items-center gap-1">
                        <span>目的の組織の左側にある</span>
                        <Button
                            variant="outline"
                            className="p-0 hover:bg-background!"
                        >
                            <Settings />
                            組織の管理
                        </Button>
                        <span>を選択する</span>
                    </div>
                    <Image
                        src={OrganizationSwitcherImage}
                        alt="<OrganizationSwitcher /> component"
                        width={400}
                        height={200}
                    />
                </li>
                <li>
                    <div className="flex flex-wrap items-center gap-1">
                        <span>PC は左側のリストから、</span>
                        <span>SP は左上のハンバーガーメニュー</span>
                        <span className="inline-flex items-center gap-1">
                            「<Menu className="size-4" />
                            組織」
                        </span>
                        <span>から、「メンバー」を選択する</span>
                    </div>
                    <Image
                        src={OrganizationProfileImage}
                        alt="<OrganizationProfile /> component"
                        width={400}
                        height={200}
                    />
                </li>
                <li>
                    <div className="space-y-1">
                        <p className="flex flex-wrap items-center gap-1">
                            <span>そこでメンバーを、</span>
                            <span>ショップ店員向けの権限</span>
                            <span>「Member」</span>
                            <span>と、企業全体を操作できる</span>
                            <span>「Admin」</span>
                            <span>に振り分ける</span>
                        </p>
                        <p className="text-xs text-destructive">
                            ※
                            普通のお客さんもリストに入っているので、間違えないように注意
                        </p>
                    </div>
                </li>
            </ul>
        </section>
    );
};
