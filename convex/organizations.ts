import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkOrgId = query({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("organizations")
      .withIndex("by_clerkOrgId", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  async handler(ctx, { data }) {
    const orgAttributes = {
      clerkOrgId: data.id as string,
      name: data.name as string,
      slug: (data.slug ?? "") as string,
      imageUrl: data.image_url as string | undefined,
      updatedAt: Date.now(),
    };

    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerkOrgId", (q) =>
        q.eq("clerkOrgId", orgAttributes.clerkOrgId)
      )
      .unique();

    if (existing === null) {
      await ctx.db.insert("organizations", orgAttributes);
    } else {
      await ctx.db.patch(existing._id, orgAttributes);
    }
  },
});
