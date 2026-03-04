import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
    fileStatus,
    tenantType,
    tenantStatus,
    storeType,
    slotStatus,
    slotVisibility,
    bookingStatus,
} from "./values";

export default defineSchema({
    Files: defineTable({
        storageId: v.id("_storage"),
        fileName: v.string(),
        contentType: v.string(),
        size: v.number(),
        status: fileStatus,
    })
        .index("by_storageId", ["storageId"])
        .index("by_status", ["status"])
        .index("by_contentType", ["contentType"]),
    Tenants: defineTable({
        createdByUserId: v.string(),
        tenantName: v.string(),
        tenantType: tenantType,
        tenantLogoFileId: v.optional(v.id("Files")),
        tenantStatus: tenantStatus,
        storeType: storeType,
    })
        .index("by_tenantName", ["tenantName"])
        .index("by_status", ["tenantStatus"])
        .index("by_type", ["tenantType"])
        .index("by_status_type", ["tenantStatus", "tenantType"]),
    TenantMemberAssignments: defineTable({
        tenantId: v.id("Tenants"),
        clerkUserId: v.string(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_user", ["clerkUserId"])
        .index("by_tenant_user", ["tenantId", "clerkUserId"]),
    TenantDetails: defineTable({
        tenantId: v.id("Tenants"),
        phoneNumber: v.optional(v.string()),
        email: v.optional(v.string()),
        address: v.optional(v.string()),
    }).index("by_tenantId", ["tenantId"]),
    Locations: defineTable({
        tenantId: v.id("Tenants"),
        name: v.string(),
        autoAddress: v.string(),
        semiAddress: v.string(),
        lat: v.number(),
        lng: v.number(),
        details: v.string(),
    }).index("by_tenant", ["tenantId"]),
    Slots: defineTable({
        tenantId: v.id("Tenants"),
        serviceId: v.id("Services"),
        locationId: v.id("Locations"),
        startAt: v.string(),
        endAt: v.string(),
        slotStatus: slotStatus,
        visibility: slotVisibility,
        capacity: v.number(),
        createdByUserId: v.string(),
        policySnapshot: v.string(),
        locationSnapshot: v.string(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_tenant_service", ["tenantId", "serviceId"])
        .index("by_tenant_startAt", ["tenantId", "startAt"]),
    Bookings: defineTable({
        tenantId: v.id("Tenants"),
        slotId: v.id("Slots"),
        status: bookingStatus,
        clerkUserId: v.string(),
        answers: v.string(),
        policySnapshot: v.string(),
    })
        .index("by_slot", ["slotId"])
        .index("by_user", ["clerkUserId"])
        .index("by_tenant", ["tenantId"])
        .index("by_slot_status", ["slotId", "status"]),
    Services: defineTable({
        tenantId: v.id("Tenants"),
        createdByUserId: v.string(),
        title: v.string(),
        description: v.string(),
        isActive: v.boolean(),
    })
        .index("by_tenant", ["tenantId"])
        .index("by_tenant_active", ["tenantId", "isActive"]),
    StaffTags: defineTable({
        title: v.string(),
        description: v.string(),
        color: v.string(),
        isActive: v.boolean(),
        createdByUserId: v.string(),
    }).index("by_active", ["isActive"]),
    UserProfiles: defineTable({
        clerkUserId: v.string(),
        customerMemo: v.optional(v.string()),
        staffMemo: v.optional(v.string()),
        staffTags: v.optional(v.array(v.id("StaffTags"))),
    }).index("by_user", ["clerkUserId"]),
    // Stripe Connect: ユーザーと Connect アカウントの対応
    // 将来は tenantId や shopId など別の識別子で紐づけることを推奨（コメント参照）
    StripeConnectAccounts: defineTable({
        clerkUserId: v.string(),
        stripeAccountId: v.string(), // acct_xxx (V2 Connected Account ID)
    })
        .index("by_user", ["clerkUserId"])
        .index("by_stripe_account", ["stripeAccountId"]),
    // サブスクリプション状態（Webhook で更新）。customer_account = Connect アカウント ID (acct_xxx)
    StripeConnectSubscriptions: defineTable({
        customerAccountId: v.string(), // V2 では .customer ではなく .customer_account を使用
        stripeSubscriptionId: v.optional(v.string()),
        status: v.string(), // active, canceled, past_due 等
        cancelAtPeriodEnd: v.optional(v.boolean()),
    }).index("by_customer_account", ["customerAccountId"]),
});
