import { v } from "convex/values";
import { authedQuery, authedMutation } from "./lib/auth";

export const listByConversation = authedQuery({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("chatMessages")
      .withIndex("by_orgId_conversation", (q) =>
        q.eq("orgId", ctx.orgId).eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const save = authedMutation({
  args: {
    conversationId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("chatMessages", {
      orgId: ctx.orgId,
      userId: ctx.userId,
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const clearConversation = authedMutation({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_orgId_conversation", (q) =>
        q.eq("orgId", ctx.orgId).eq("conversationId", args.conversationId)
      )
      .collect();
    await Promise.all(messages.map((m) => ctx.db.delete(m._id)));
  },
});
