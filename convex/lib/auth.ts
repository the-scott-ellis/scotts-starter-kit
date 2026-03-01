import { ConvexError } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";

/**
 * authedQuery — wraps query with authentication + org context.
 *
 * Injects `ctx.userId` (Clerk user ID) and `ctx.orgId` (Clerk org ID).
 * Throws if the user is not authenticated or has no active organization.
 *
 * Usage:
 *   export const list = authedQuery({
 *     args: {},
 *     handler: async (ctx) => {
 *       return ctx.db.query("projects")
 *         .withIndex("by_orgId", (q) => q.eq("orgId", ctx.orgId))
 *         .collect();
 *     },
 *   });
 */
export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) throw new ConvexError("No organization selected");
    return {
      ctx: { userId: identity.subject, orgId },
      args: {},
    };
  },
});

/**
 * authedMutation — wraps mutation with authentication + org context.
 *
 * Same guarantees as authedQuery.
 */
export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");
    const orgId = (identity as any).org_id as string | undefined;
    if (!orgId) throw new ConvexError("No organization selected");
    return {
      ctx: { userId: identity.subject, orgId },
      args: {},
    };
  },
});
