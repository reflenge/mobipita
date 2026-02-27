import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireMinRole, requireStaffOrAbove } from "./lib/clerkAuth";

export const list = query({
    args: {},
    handler: async (ctx) => {
        await requireStaffOrAbove(ctx);
        return ctx.db
            .query("StaffTags")
            .withIndex("by_active", (q) => q.eq("isActive", true))
            .collect();
    },
});

export const listAll = query({
    args: {},
    handler: async (ctx) => {
        await requireMinRole(ctx, "company");
        return ctx.db.query("StaffTags").order("desc").collect();
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await requireMinRole(ctx, "company");
        const userId = identity.subject!;
        return await ctx.db.insert("StaffTags", {
            title: args.title,
            description: args.description,
            color: args.color,
            isActive: true,
            createdByUserId: userId,
        });
    },
});

export const update = mutation({
    args: {
        tagId: v.id("StaffTags"),
        title: v.string(),
        description: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        await requireMinRole(ctx, "company");
        const tag = await ctx.db.get(args.tagId);
        if (!tag) throw new Error("タグが見つかりません");
        await ctx.db.patch(args.tagId, {
            title: args.title,
            description: args.description,
            color: args.color,
        });
        return args.tagId;
    },
});

export const deactivate = mutation({
    args: {
        tagId: v.id("StaffTags"),
    },
    handler: async (ctx, args) => {
        await requireMinRole(ctx, "company");
        const tag = await ctx.db.get(args.tagId);
        if (!tag) throw new Error("タグが見つかりません");
        await ctx.db.patch(args.tagId, { isActive: false });
        return args.tagId;
    },
});

export const activate = mutation({
    args: {
        tagId: v.id("StaffTags"),
    },
    handler: async (ctx, args) => {
        await requireMinRole(ctx, "company");
        const tag = await ctx.db.get(args.tagId);
        if (!tag) throw new Error("タグが見つかりません");
        await ctx.db.patch(args.tagId, { isActive: true });
        return args.tagId;
    },
});
