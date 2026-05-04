import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createGuestSession = mutation({
  args: {
    ipHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const token = Math.random().toString(36).substring(2) + now.toString(36);

    await ctx.db.insert("guestSessions", {
      ipHash: args.ipHash,
      sessionToken: token,
      analysisCount: 0,
      maxAnalyses: 3,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: now,
    });

    return { sessionToken: token };
  },
});
