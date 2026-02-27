import { ConvexError } from "convex/values";
import { ROLE_LEVEL } from "../values";
import type { UserIdentity } from "convex/server";

export type AppRole = "admin" | "company" | "staff" | "customer";

type ClerkAuthContext = {
    auth: {
        getUserIdentity: () => Promise<UserIdentity | null>;
    };
};

const defaultAuthErrorMessage = "認証されていないため、操作できません。";
const defaultUserIdErrorMessage = "Clerk userId が取得できません。";
const defaultCompanyErrorMessage = "会社管理者権限が必要です。";
const defaultStaffErrorMessage = "スタッフ以上の権限が必要です。";

export const getClerkIdentity = async (ctx: ClerkAuthContext) => {
    return await ctx.auth.getUserIdentity();
};

export const isClerkAuthenticated = async (ctx: ClerkAuthContext) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity !== null;
};

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

export const requireClerkUserId = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultAuthErrorMessage,
) => {
    const identity = await requireClerkIdentity(ctx, errorMessage);
    return getClerkUserIdFromIdentity(identity);
};

const VALID_ROLES = new Set<string>(["admin", "company", "staff", "customer"]);

/**
 * JWT の role クレームからロールを取得する。
 */
export const getRoleFromIdentity = (identity: UserIdentity): AppRole => {
    const role = (identity as Record<string, unknown>).role;
    if (typeof role === "string" && VALID_ROLES.has(role)) {
        return role as AppRole;
    }
    return "customer";
};

export const hasMinRole = (userRole: AppRole, minRole: AppRole): boolean => {
    return (ROLE_LEVEL[userRole] ?? 0) >= (ROLE_LEVEL[minRole] ?? 0);
};

export const requireMinRole = async (
    ctx: ClerkAuthContext,
    minRole: AppRole,
    errorMessage?: string,
) => {
    const identity = await requireClerkIdentity(ctx, errorMessage);
    const role = getRoleFromIdentity(identity);
    if (!hasMinRole(role, minRole)) {
        throw new ConvexError(
            errorMessage ?? `${minRole} 以上の権限が必要です。`,
        );
    }
    return identity;
};

/**
 * company 以上の権限を要求する。
 */
export const requireAdmin = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultCompanyErrorMessage,
) => {
    return requireMinRole(ctx, "company", errorMessage);
};

/**
 * スタッフ以上の権限を要求する。
 */
export const requireStaffOrAbove = async (
    ctx: ClerkAuthContext,
    errorMessage: string = defaultStaffErrorMessage,
) => {
    return requireMinRole(ctx, "staff", errorMessage);
};
