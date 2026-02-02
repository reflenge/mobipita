const labelMap: Record<string, string> = {
    admin: "Admin",
    member: "Member",
    customer: "Customer",
    tenant: "店舗",
    create: "作成",
    list: "一覧",
    slots: "予約枠",
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
 * `orgId` を除いた `/o/[orgId]` 配下のパスについて、ページが存在するルートのみ true を返す。
 *
 * 例:
 * - `/`（= `/o/[orgId]`）は true
 * - `/member/tenant`（ページなし）は false
 * - `/member/tenant/:tenantId` は true
 */
export function isExistingOrgRoute(orgScopedPath: string): boolean {
    const p = orgScopedPath === "" ? "/" : orgScopedPath;

    const patterns: RegExp[] = [
        // org home
        /^\/$/,

        // admin
        /^\/admin$/,
        /^\/admin\/tenant$/,
        /^\/admin\/tenant\/create$/,
        /^\/admin\/tenant\/list$/,
        /^\/admin\/tenant\/[^/]+$/, // [tenantId]
        /^\/admin\/tenant\/employee-assignments$/,
        /^\/admin\/tenant\/employee-assignments\/upgrade$/,
        /^\/admin\/tenant\/employee-assignments\/assignment$/,

        // member
        /^\/member$/,
        /^\/member\/tenant\/[^/]+$/, // [tenantId]
        /^\/member\/tenant\/[^/]+\/slots\/create$/, // slots/create

        // customer
        /^\/\(\s*CUSTOMER\s*\)$/, // 念のため（通常はURLに出ない）
    ];

    return patterns.some((re) => re.test(p));
}
