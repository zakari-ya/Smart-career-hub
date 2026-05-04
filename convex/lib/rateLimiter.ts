import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const consumeRateLimit = internalMutation({
  args: {
    userId: v.string(),
    resource: v.string(),
    maxCount: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_resource", (q) =>
        q.eq("userId", args.userId).eq("resource", args.resource)
      )
      .first();

    if (!limit) {
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        resource: args.resource,
        count: 1,
        windowStart: now,
      });
      return { success: true };
    }

    // Reset window if it has passed
    if (now - limit.windowStart > args.windowMs) {
      await ctx.db.patch(limit._id, {
        count: 1,
        windowStart: now,
      });
      return { success: true };
    }

    if (limit.count >= args.maxCount) {
      await ctx.db.insert("auditLogs", {
        userId: args.userId,
        action: "rate_limit_hit",
        metadata: JSON.stringify({ resource: args.resource, maxCount: args.maxCount }),
        timestamp: now,
      });
      return { success: false, retryAfter: limit.windowStart + args.windowMs - now };
    }

    await ctx.db.patch(limit._id, {
      count: limit.count + 1,
    });
    return { success: true };
  },
});
