import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { fileStatus } from "./values";

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

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const saveFile = mutation({
    args: {
        storageId: v.id("_storage"),
        fileName: v.string(),
        contentType: v.string(),
        size: v.number(),
    },
    handler: async (ctx, args) => {
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

export const updateFileStatus = mutation({
    args: {
        fileId: v.id("Files"),
        status: fileStatus,
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.fileId, {
            status: args.status,
        });
    },
});
