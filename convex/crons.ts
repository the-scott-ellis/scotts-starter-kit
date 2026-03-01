import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Convex scheduled functions.
 *
 * Add cron jobs here for recurring background tasks.
 * See: https://docs.convex.dev/scheduling/cron-jobs
 *
 * Pattern for delayed mutations (from a mutation or action):
 *   await ctx.scheduler.runAfter(24 * 60 * 60 * 1000, internal.yourModule.yourFunction, { arg: "value" });
 *   await ctx.scheduler.runAt(new Date("2025-01-01"), internal.yourModule.yourFunction, { arg: "value" });
 */
const crons = cronJobs();

// Example: daily cleanup at midnight UTC
// Uncomment and wire to a real internal function when needed:
//
// crons.daily(
//   "daily-cleanup",
//   { hourUTC: 0, minuteUTC: 0 },
//   internal.yourModule.cleanupStaleData
// );

// Example: weekly digest every Monday at 9am UTC
//
// crons.weekly(
//   "weekly-digest",
//   { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
//   internal.yourModule.sendWeeklyDigest
// );

export default crons;
