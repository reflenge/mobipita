/**
 * アプリ全体で共有するロール定義とヘルパー。
 *
 * 強い順: admin > company > staff > customer
 */

export type AppRole = "admin" | "company" | "staff" | "customer";

export const ROLE_LEVEL: Record<AppRole, number> = {
    admin: 40,
    company: 30,
    staff: 20,
    customer: 10,
};

export const ROLE_LABELS: Record<AppRole, string> = {
    admin: "管理者",
    company: "会社",
    staff: "スタッフ",
    customer: "カスタマー",
};

/** 強い順に並んだ全ロール */
export const ALL_ROLES: AppRole[] = ["admin", "company", "staff", "customer"];

const VALID_ROLES = new Set<string>(Object.keys(ROLE_LEVEL));

/** Claims からロールを取得する。無効値や未設定時は "customer" を返す。 */
export function getRoleFromClaims(
    claims: { metadata?: { role?: string } } | null | undefined,
): AppRole {
    const raw = claims?.metadata?.role;
    if (raw && VALID_ROLES.has(raw)) return raw as AppRole;
    return "customer";
}

/** userRole が minRole 以上の権限を持つか判定する。 */
export function hasMinRole(userRole: AppRole, minRole: AppRole): boolean {
    return ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole];
}

/**
 * 操作者のロールに応じて、割り当て可能なロール一覧を返す。
 * 自分のロール以下のみ割り当て可能。
 */
export function assignableRoles(operatorRole: AppRole): AppRole[] {
    const level = ROLE_LEVEL[operatorRole];
    return ALL_ROLES.filter((r) => ROLE_LEVEL[r] <= level);
}
