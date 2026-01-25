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
