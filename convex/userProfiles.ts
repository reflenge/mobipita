import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
    requireClerkIdentity,
    requireClerkUserId,
    requireStaffOrAbove,
    getRoleFromIdentity,
    getClerkUserIdFromIdentity,
} from "./lib/clerkAuth";

export const getMyProfile = query({
    args: {},
    handler: async (ctx) => {
        const userId = await requireClerkUserId(ctx);
        const profile = await ctx.db
            .query("UserProfiles")
            .withIndex("by_user", (q) => q.eq("clerkUserId", userId))
            .first();
        return {
            customerMemo: profile?.customerMemo ?? "",
        };
    },
});

export const getByUserId = query({
    args: {
        clerkUserId: v.string(),
    },
    handler: async (ctx, args) => {
        await requireStaffOrAbove(ctx);
        const profile = await ctx.db
            .query("UserProfiles")
            .withIndex("by_user", (q) => q.eq("clerkUserId", args.clerkUserId))
            .first();
        if (!profile) {
            return {
                customerMemo: "",
                staffMemo: "",
                staffTags: [] as string[],
            };
        }
        return {
            customerMemo: profile.customerMemo ?? "",
            staffMemo: profile.staffMemo ?? "",
            staffTags: profile.staffTags ?? [],
        };
    },
});

export const updateCustomerMemo = mutation({
    args: {
        customerMemo: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await requireClerkUserId(ctx);
        const existing = await ctx.db
            .query("UserProfiles")
            .withIndex("by_user", (q) => q.eq("clerkUserId", userId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, {
                customerMemo: args.customerMemo,
            });
            return existing._id;
        }
        return await ctx.db.insert("UserProfiles", {
            clerkUserId: userId,
            customerMemo: args.customerMemo,
        });
    },
});

export const updateStaffMemo = mutation({
    args: {
        clerkUserId: v.string(),
        staffMemo: v.string(),
    },
    handler: async (ctx, args) => {
        await requireStaffOrAbove(ctx);
        const existing = await ctx.db
            .query("UserProfiles")
            .withIndex("by_user", (q) => q.eq("clerkUserId", args.clerkUserId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, {
                staffMemo: args.staffMemo,
            });
            return existing._id;
        }
        return await ctx.db.insert("UserProfiles", {
            clerkUserId: args.clerkUserId,
            staffMemo: args.staffMemo,
        });
    },
});

export const setStaffTags = mutation({
    args: {
        clerkUserId: v.string(),
        tagIds: v.array(v.id("StaffTags")),
    },
    handler: async (ctx, args) => {
        await requireStaffOrAbove(ctx);

        for (const tagId of args.tagIds) {
            const tag = await ctx.db.get(tagId);
            if (!tag || !tag.isActive) {
                throw new Error(`無効なタグが含まれています: ${tagId}`);
            }
        }

        const existing = await ctx.db
            .query("UserProfiles")
            .withIndex("by_user", (q) => q.eq("clerkUserId", args.clerkUserId))
            .first();
        if (existing) {
            await ctx.db.patch(existing._id, {
                staffTags: args.tagIds,
            });
            return existing._id;
        }
        return await ctx.db.insert("UserProfiles", {
            clerkUserId: args.clerkUserId,
            staffTags: args.tagIds,
        });
    },
});
