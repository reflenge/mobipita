"use client";

import { OrganizationProfile, useOrganization } from "@clerk/nextjs";

// 管理画面を表示するロール名（Clerk 側のロール設定と一致させる）。
const ADMIN_ROLE = "org:admin";

const OrganizationAdminPanel = () => {
    // アクティブな Organization と自分の membership を取得する。
    const { isLoaded, membership } = useOrganization();

    // 初期ロード中や membership 未取得時は何も描画しない。
    if (!isLoaded || !membership) {
        return null;
    }
    console.log("🚀 => OrganizationAdminPanel => membership:", membership)

    // admin 以外は管理 UI を表示しない。
    if (membership.role !== ADMIN_ROLE) {
        return null;
    }

    return (
        <section className="mt-10">
            {/* 管理者向けの Clerk Organization 管理 UI */}
            <OrganizationProfile routing="hash" />
        </section>
    );
};

export default OrganizationAdminPanel;
