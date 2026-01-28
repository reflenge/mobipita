import type { UserIdentity } from "convex/server";
import { ConvexError } from "convex/values";

/**
 * Convex の ctx から認証情報を取得するための最小インターフェース。
 */
type ClerkAuthContext = {
    auth: {
        getUserIdentity: () => Promise<UserIdentity | null>;
    };
};

/**
 * 認証失敗時のデフォルトメッセージ。
 */
const defaultAuthErrorMessage =
    "認証されていないため、操作できません。";
/**
 * userId を取り出せないときのデフォルトメッセージ。
 */
const defaultUserIdErrorMessage = "Clerk userId が取得できません。";
/**
 * org:admin 権限が必要なときのデフォルトメッセージ。
 */
const defaultOrgAdminErrorMessage = "組織の管理者権限が必要です。";
/**
 * org:admin または org:member が必要なときのデフォルトメッセージ。
 */
const defaultOrgMemberErrorMessage = "組織メンバー権限が必要です。";

/**
 * Clerk の identity をそのまま返す（未認証なら null）。
 */
export const getClerkIdentity = async (ctx: ClerkAuthContext) => {
    return await ctx.auth.getUserIdentity();
};

/**
 * 認証済みかどうかだけを判定する。
 */
export const isClerkAuthenticated = async (ctx: ClerkAuthContext) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity !== null;
};

/**
 * 認証必須。未認証なら ConvexError を投げる。
 */
export const requireClerkIdentity = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultAuthErrorMessage,
) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
        throw new ConvexError(errorMessage);
    }
    return identity;
};

/**
 * tokenIdentifier から Clerk userId を抽出する。
 */
export const getClerkUserIdFromIdentity = (
    identity: UserIdentity,
    errorMessage: string = defaultUserIdErrorMessage,
) => {
    const userId = identity.subject;
    if (!userId) {
        throw new ConvexError(errorMessage);
    }
    return userId;
};

/**
 * Clerk の JWT から組織ロールを取り出す。
 */
export const getClerkOrgRoleFromIdentity = (identity: UserIdentity) => {
    const orgRole =
        identity.org_role ??
        identity.orgRole ??
        identity.organization_role ??
        identity.organizationRole;
    return typeof orgRole === "string" ? orgRole : null;
};

/**
 * 認証必須で userId を取得する（未認証ならエラー）。
 */
export const requireClerkUserId = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultAuthErrorMessage,
) => {
    const identity = await requireClerkIdentity(ctx, errorMessage);
    return getClerkUserIdFromIdentity(identity);
};

/**
 * org:admin 権限が必須。未認証または権限不足なら ConvexError を投げる。
 */
export const requireClerkOrgAdmin = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultOrgAdminErrorMessage,
) => {
    const identity = await requireClerkIdentity(ctx, errorMessage);
    const role = getClerkOrgRoleFromIdentity(identity);
    if (role !== "org:admin") {
        throw new ConvexError(errorMessage);
    }
    return identity;
};

/**
 * org:admin または org:member 権限が必須。権限不足なら ConvexError を投げる。
 */
export const requireClerkOrgAdminOrMember = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultOrgMemberErrorMessage,
) => {
    const identity = await requireClerkIdentity(ctx, errorMessage);
    const role = getClerkOrgRoleFromIdentity(identity);
    if (role !== "org:admin" && role !== "org:member") {
        throw new ConvexError(errorMessage);
    }
    return identity;
};
