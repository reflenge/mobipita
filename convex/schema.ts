import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const messageScope = v.union(v.literal("global"), v.literal("organization"));

export default defineSchema({
    Messages: defineTable({
        text: v.string(),
        userId: v.string(),
        scope: messageScope,
        orgId: v.optional(v.string()),
    })
        .index("by_scope", ["scope"])
        .index("by_scope_orgId", ["scope", "orgId"]),
});
