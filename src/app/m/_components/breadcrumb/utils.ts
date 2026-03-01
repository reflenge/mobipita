const labelMap: Record<string, string> = {
    m: "管理",
    admin: "管理者",
    staff: "スタッフ",
    company: "会社管理",
    users: "ユーザー",
    links: "リンク集",
    tags: "タグ",
    tenant: "店舗",
    create: "作成",
    list: "一覧",
    slots: "予約枠",
    services: "サービス",
    locations: "出店場所",
    account: "アカウント",
    customer: "Customer",
    search: "店舗検索",
    "employee-assignments": "従業員割当",
    upgrade: "従業員へ昇格",
    assignment: "各テナントへ振り分け",
};

export function truncateLabel(label: string, maxChars = 12): string {
    if (label.length <= maxChars) return label;
    return `${label.slice(0, maxChars)}…`;
}

export function getSegmentLabel(segment: string): string {
    return labelMap[segment] ?? segment;
}

/**
 * 指定されたパスについて、ページが存在するルートのみ true を返す。
 * 管理画面は /m プレフィックス。
 */
export function isExistingRoute(path: string): boolean {
    const p = path === "" ? "/" : path;

    const patterns: RegExp[] = [
        // org home
        /^\/$/,

        // 管理 /m
        /^\/m$/,
        /^\/m\/staff$/,
        /^\/m\/staff\/tenant$/,
        /^\/m\/staff\/tenant\/[^/]+$/, // [tenantId]
        /^\/m\/staff\/tenant\/[^/]+\/services$/,
        /^\/m\/staff\/tenant\/[^/]+\/services\/create$/,
        /^\/m\/staff\/tenant\/[^/]+\/services\/[^/]+$/, // [serviceId]
        /^\/m\/staff\/tenant\/[^/]+\/locations$/,
        /^\/m\/staff\/tenant\/[^/]+\/locations\/create$/,
        /^\/m\/staff\/tenant\/[^/]+\/locations\/[^/]+$/, // [locationId]
        /^\/m\/staff\/tenant\/[^/]+\/slots$/,
        /^\/m\/staff\/tenant\/[^/]+\/slots\/create$/,

        /^\/m\/company$/,
        /^\/m\/company\/tenant$/,
        /^\/m\/company\/tenant\/list$/,
        /^\/m\/company\/tenant\/create$/,
        /^\/m\/company\/tenant\/[^/]+$/, // [tenantId]
        /^\/m\/company\/users$/,
        /^\/m\/company\/users\/[^/]+$/, // [userId]
        /^\/m\/company\/tags$/,

        /^\/m\/admin$/,
        /^\/m\/admin\/users$/,
        /^\/m\/admin\/users\/[^/]+$/, // [userId]
        /^\/m\/admin\/links$/,

        /^\/m\/account$/,
        /^\/m\/account\/[^/]+$/,
    ];

    return patterns.some((re) => re.test(p));
}
