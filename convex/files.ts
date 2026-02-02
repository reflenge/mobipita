import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { fileStatus } from "./values";
// import { requireClerkIdentity } from "./lib/clerkAuth";

/**
 * 複数の Files レコード ID に対応するストレージ URL を返す。
 * サイドバーなどでテナントロゴを表示するために使用する。
 */
export const getStorageUrls = query({
    args: {
        fileIds: v.array(v.id("Files")),
    },
    handler: async (ctx, args) => {
        const result: Record<string, string> = {};
        for (const id of args.fileIds) {
            const file = await ctx.db.get(id);
            if (file) {
                const url = await ctx.storage.getUrl(file.storageId);
                if (url) result[id] = url;
            }
        }
        return result;
    },
});

/**
 * ファイルアップロード用の一時 URL を発行する。
 *
 * - 現状は認可チェックをしていない（TODO）。
 * - 返却された URL はクライアントが直接アップロードに使用する。
 *
 * @returns アップロード用の一時 URL。
 */
export const generateUploadUrl = mutation(async (ctx) => {
    // 必要ならここで認可チェック
    // await requireClerkIdentity(ctx, "Unauthorized");

    return await ctx.storage.generateUploadUrl();
});

/**
 * ファイルメタデータを保存する。
 *
 * - ファイル本体は `_storage` に保存済みである前提。
 * - ここではメタデータのみを DB に記録する。
 * - 初期ステータスは `temporary` で固定。
 * - 現状は認可チェックをしていない（TODO）。
 *
 * @param args.storageId `_storage` の ID。
 * @param args.fileName オリジナルのファイル名。
 * @param args.contentType MIME タイプ。
 * @param args.size ファイルサイズ（bytes）。
 * @returns 保存したレコードの ID。
 */
export const saveFile = mutation({
    args: {
        storageId: v.id("_storage"),
        fileName: v.string(),
        contentType: v.string(),
        size: v.number(),
        // status: v.union(v.literal("temporary"), v.literal("attached")),
    },
    handler: async (ctx, args) => {
        // TODO: 認可チェック
        // await requireClerkIdentity(ctx, "Unauthorized");

        const id = await ctx.db.insert("Files", {
            storageId: args.storageId,
            fileName: args.fileName,
            contentType: args.contentType,
            size: args.size,
            status: "temporary",
        });

        return id;
    },
});

/**
 * ファイルの状態を更新する。
 *
 * - `temporary` / `attached` の切り替えのみを想定。
 * - 現状は認可チェックをしていない（TODO）。
 *
 * @param args.fileId ファイルレコードの ID。
 * @param args.status 新しい状態。
 * @returns 更新後のファイルレコード。
 */
export const updateFileStatus = mutation({
    args: {
        fileId: v.id("Files"),
        status: fileStatus,
    },
    handler: async (ctx, args) => {
        // TODO: 認可チェック
        // await requireClerkIdentity(ctx, "Unauthorized");

        const updatedFile = await ctx.db.patch("Files", args.fileId, {
            status: args.status,
        });

        return updatedFile;
    },
});
