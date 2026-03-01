import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
  // ── Users ──────────────────────────────────────────────────────────────────
  // Synced from Clerk user webhooks
  users: defineTable({
    externalId: v.string(),      // Clerk user ID (JWT `sub` claim)
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("byExternalId", ["externalId"])
    .index("by_email", ["email"]),

  // ── Organizations ──────────────────────────────────────────────────────────
  // Synced from Clerk organization webhooks
  organizations: defineTable({
    clerkOrgId: v.string(),        // Clerk org ID (e.g. "org_xxxxx")
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    // Stripe escape hatch — only populated if migrating from Clerk Billing to direct Stripe
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise"))),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    stripeCurrentPeriodEnd: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_clerkOrgId", ["clerkOrgId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  // ── Projects ───────────────────────────────────────────────────────────────
  // Example org-scoped CRUD resource — the template to copy for new resources
  projects: defineTable({
    orgId: v.string(),             // Clerk org ID — the key tenancy field
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
    createdBy: v.string(),         // Clerk user ID of creator
    updatedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_status", ["orgId", "status"]),

  // ── Chat Messages ──────────────────────────────────────────────────────────
  // AI chat persistence — optional, can be toggled off
  chatMessages: defineTable({
    orgId: v.string(),
    userId: v.string(),            // Clerk user ID
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    conversationId: v.string(),    // Groups messages into a conversation
    createdAt: v.number(),
  }).index("by_orgId_conversation", ["orgId", "conversationId"]),

  // ── Payment Attempts ───────────────────────────────────────────────────────
  // Existing — payment tracking from Clerk Billing webhooks
  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),
});
