import { internalMutation } from "./_generated/server";

export const cleanupGuestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredSessions = await ctx.db
      .query("guestSessions")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();

    for (const session of expiredSessions) {
      const analyses = await ctx.db
        .query("guestAnalyses")
        .withIndex("by_session", (q) => q.eq("guestSessionId", session._id))
        .collect();

      for (const analysis of analyses) {
        await ctx.db.delete(analysis._id);
      }
      
      await ctx.db.delete(session._id);
    }
  },
});
