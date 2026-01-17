import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { messageTextSchema } from "../src/components/samples/messages/shared/messageSchema";
import { defaultMessageLimit, messageScope } from "./messages.constants";
import { fetchClerkUserProfile } from "./messages.clerk";

// メッセージを保存する Mutation。
export const create = mutation({
    args: {
        text: v.string(),
        scope: messageScope,
        orgId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 送信本文をスキーマで検証する。
        const text = messageTextSchema.parse(args.text);
        // Clerk の認証情報を取得し、未認証なら弾く。
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error("認証されていないため、送信できません。");
        }
        // 組織チャットの場合は orgId が必須。
        if (args.scope === "organization" && !args.orgId) {
            throw new Error("組織チャットには組織IDが必要です。");
        }
        // メッセージ本文と送信者情報、スコープを保存する。
        await ctx.db.insert("Messages", {
            text,
            // tokenIdentifier から Clerk の userId を取り出す。
            userId: identity.tokenIdentifier.split("|")[1],
            scope: args.scope,
            orgId: args.scope === "organization" ? args.orgId : undefined,
        });
    },
});

// メッセージ一覧を取得する Query。
export const lists = query({
    args: {
        scope: messageScope,
        orgId: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 未認証アクセスは拒否する。
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error("認証されていないため、取得できません。");
        }
        // 取得件数はデフォルト上限を使い、負荷を抑える。
        const limit =
            typeof args.limit === "number" ? args.limit : defaultMessageLimit;
        // 組織チャットの場合は orgId が必須。
        if (args.scope === "organization" && !args.orgId) {
            throw new Error("組織チャットには組織IDが必要です。");
        }
        if (args.scope === "organization") {
            // 組織スコープでは orgId が一致するものだけ返す。
            return ctx.db
                .query("Messages")
                .withIndex("by_scope_orgId", (q) =>
                    q.eq("scope", "organization").eq("orgId", args.orgId)
                )
                .order("desc")
                .take(limit);
        }
        // グローバルスコープでは組織メッセージ以外を返す。
        return ctx.db
            .query("Messages")
            .withIndex("by_scope", (q) => q.eq("scope", "global"))
            .order("desc")
            .take(limit);
    },
});

// userId から Clerk の最新プロフィール情報を取得する。
export const resolveUserProfiles = action({
    args: {
        userIds: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        // Action でも認証チェックを行う。
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error("認証されていないため、取得できません。");
        }
        // 空のリクエストは無駄な処理を避ける。
        if (args.userIds.length === 0) {
            return {};
        }
        // 重複した userId をまとめて API 呼び出し数を減らす。
        const uniqueUserIds = Array.from(new Set(args.userIds));
        // Clerk API を並列で呼び出してプロフィールを取得する。
        const results = await Promise.all(
            uniqueUserIds.map(async (userId) => {
                try {
                    const profile = await fetchClerkUserProfile(userId);
                    return [userId, profile] as const;
                } catch (error) {
                    // 個別の取得失敗はログに残し、null 値で返す。
                    console.error("Clerk 取得失敗", userId, error);
                    return [userId, { name: null, pictureUrl: null }] as const;
                }
            })
        );
        // userId をキーにした辞書形式で返却する。
        return Object.fromEntries(results);
    },
});
