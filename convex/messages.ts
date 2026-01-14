import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { messageTextSchema } from "../src/components/samples/messages/shared/messageSchema";

// メッセージの送信先（全体 / 組織）を厳密に制限する。
const messageScope = v.union(v.literal("global"), v.literal("organization"));
// Clerk の REST API を呼び出すためのベース URL。
const clerkApiBaseUrl = "https://api.clerk.com/v1";
// 取得するメッセージ件数の上限（無制限にしないため）。
const defaultMessageLimit = 100;

type ClerkUserProfile = {
    // 表示名（空の場合は null）。
    name: string | null;
    // アバター画像 URL（空の場合は null）。
    pictureUrl: string | null;
};

// Convex の環境変数から Clerk の秘密鍵を取得する。
const getClerkSecretKey = () => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
        throw new Error("CLERK_SECRET_KEY が設定されていません。");
    }
    return secretKey;
};

// Clerk のユーザーデータから表示名を組み立てる。
const buildDisplayName = (user: {
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    email_addresses?: Array<{ email_address: string }>;
    full_name?: string | null;
}) => {
    // full_name があれば最優先で採用する。
    if (user.full_name && user.full_name.trim()) {
        return user.full_name.trim();
    }
    // first/last があれば結合して表示名にする。
    const fullName = [user.first_name, user.last_name]
        .filter((value) => value && value.trim())
        .join(" ")
        .trim();
    if (fullName) {
        return fullName;
    }
    // username があればフォールバックとして使う。
    if (user.username && user.username.trim()) {
        return user.username.trim();
    }
    // 最後の手段としてメールアドレスを使う。
    const primaryEmail = user.email_addresses?.[0]?.email_address;
    return primaryEmail ?? null;
};

// Clerk の REST API からユーザー情報を取得して表示用に整形する。
const fetchClerkUserProfile = async (
    userId: string
): Promise<ClerkUserProfile> => {
    // サーバー側で Clerk API を呼び、最新のプロフィールを取得する。
    const response = await fetch(`${clerkApiBaseUrl}/users/${userId}`, {
        headers: {
            Authorization: `Bearer ${getClerkSecretKey()}`,
        },
    });
    // HTTP エラーはそのまま上位に伝搬させる。
    if (!response.ok) {
        throw new Error(`Clerk 取得エラー: ${response.status}`);
    }
    // 必要なプロパティだけ使う。
    const user = (await response.json()) as {
        first_name?: string | null;
        last_name?: string | null;
        username?: string | null;
        email_addresses?: Array<{ email_address: string }>;
        full_name?: string | null;
        image_url?: string | null;
    };
    return {
        name: buildDisplayName(user),
        pictureUrl: user.image_url ?? null,
    };
};

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
