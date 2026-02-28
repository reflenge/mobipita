/**
 * Stripe Connect: ユーザーと Connected Account ID のマッピング
 *
 * Stripe API の呼び出しは Next.js API ルートで行い、ここでは DB の読み書きのみ行います。
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireClerkUserId } from "./lib/clerkAuth";

/** 現在のユーザーの Connect アカウント ID を取得 */
export const getMyConnectAccount = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireClerkUserId(ctx);
        const row = await ctx.db
            .query("StripeConnectAccounts")
            .withIndex("by_user", (q) => q.eq("clerkUserId", userId))
            .first();
        return row?.stripeAccountId ?? null;
    },
});

/**
 * ユーザーと Connect アカウントの紐づけを保存
 * 認証済みユーザーが自分の stripeAccountId のみ渡す（clerkUserId はサーバーで取得）
 */
export const setConnectAccount = mutation({
    args: {
        stripeAccountId: v.string(),
    },
    handler: async (ctx, args) => {
        const clerkUserId = await requireClerkUserId(ctx);
        const existing = await ctx.db
            .query("StripeConnectAccounts")
            .withIndex("by_user", (q) => q.eq("clerkUserId", clerkUserId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, { stripeAccountId: args.stripeAccountId });
            return existing._id;
        }
        return await ctx.db.insert("StripeConnectAccounts", {
            clerkUserId,
            stripeAccountId: args.stripeAccountId,
        });
    },
});

/** サブスクリプション状態を更新（Webhook ハンドラから呼ぶ想定） */
export const upsertSubscriptionStatus = mutation({
    args: {
        customerAccountId: v.string(),
        stripeSubscriptionId: v.optional(v.string()),
        status: v.string(),
        cancelAtPeriodEnd: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("StripeConnectSubscriptions")
            .withIndex("by_customer_account", (q) =>
                q.eq("customerAccountId", args.customerAccountId)
            )
            .first();
        const data = {
            customerAccountId: args.customerAccountId,
            stripeSubscriptionId: args.stripeSubscriptionId,
            status: args.status,
            cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        };
        if (existing) {
            await ctx.db.patch(existing._id, data);
            return existing._id;
        }
        return await ctx.db.insert("StripeConnectSubscriptions", data);
    },
});

/** サブスクリプション削除時（Webhook customer.subscription.deleted） */
export const removeSubscriptionStatus = mutation({
    args: { customerAccountId: v.string() },
    handler: async (ctx, args) => {
        const row = await ctx.db
            .query("StripeConnectSubscriptions")
            .withIndex("by_customer_account", (q) =>
                q.eq("customerAccountId", args.customerAccountId)
            )
            .first();
        if (row) await ctx.db.delete(row._id);
    },
});

/** 現在のユーザーのサブスクリプション状態を取得 */
export const getMySubscriptionStatus = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireClerkUserId(ctx);
        const accountRow = await ctx.db
            .query("StripeConnectAccounts")
            .withIndex("by_user", (q) => q.eq("clerkUserId", userId))
            .first();
        if (!accountRow) return null;
        const sub = await ctx.db
            .query("StripeConnectSubscriptions")
            .withIndex("by_customer_account", (q) =>
                q.eq("customerAccountId", accountRow.stripeAccountId)
            )
            .first();
        return sub;
    },
});
