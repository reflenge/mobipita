import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { messageTextSchema } from "../src/shared/messageSchema";

export const create = mutation({
    args: { text: v.string() },
    handler: async (ctx, args) => {
        const text = messageTextSchema.parse(args.text);
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error("Unauthenticated call to mutation どのエラー");
        }
        await ctx.db.insert("Messages", {
            text,
            userId: identity.tokenIdentifier.split("|")[1],
            name: identity.name,
            pictureUrl: identity.pictureUrl,
        });
    },
});

export const lists = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (identity === null) {
            throw new Error("Unauthenticated call to mutation このエラー");
        }
        return await ctx.db.query("Messages").order("desc").collect();
    },
});
