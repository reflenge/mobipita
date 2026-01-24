import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
    // 必要ならここで認可チェック
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.storage.generateUploadUrl();
});

export const saveImage = mutation({
    args: {
        storageId: v.id("_storage"),
        fileName: v.string(),
        contentType: v.string(),
        size: v.number(),
    },
    handler: async (ctx, args) => {
        // 必要ならここで認可チェック
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const id = await ctx.db.insert("images", {
            storageId: args.storageId,
            fileName: args.fileName,
            contentType: args.contentType,
            size: args.size,
        });

        return id;
    },
});
