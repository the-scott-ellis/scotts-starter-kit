import { v } from "convex/values";
import { authedQuery, authedMutation } from "./lib/auth";

export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", ctx.orgId))
      .order("desc")
      .collect();
  },
});

export const get = authedQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project || project.orgId !== ctx.orgId) return null;
    return project;
  },
});

export const create = authedMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("projects", {
      orgId: ctx.orgId,
      createdBy: ctx.userId,
      updatedAt: Date.now(),
      ...args,
    });
  },
});

export const update = authedMutation({
  args: {
    id: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const project = await ctx.db.get(id);
    if (!project || project.orgId !== ctx.orgId) {
      throw new Error("Project not found");
    }
    return ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = authedMutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project || project.orgId !== ctx.orgId) {
      throw new Error("Project not found");
    }
    return ctx.db.delete(args.id);
  },
});
