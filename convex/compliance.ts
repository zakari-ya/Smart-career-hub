import { mutation } from "./_generated/server";

export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    // Delete resumes
    const resumes = await ctx.db.query("resumes").withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject)).collect();
    for (const r of resumes) {
      if (r.fileStorageId) await ctx.storage.delete(r.fileStorageId);
      await ctx.db.delete(r._id);
    }

    // Delete analyses
    const analyses = await ctx.db.query("analyses").withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject)).collect();
    for (const a of analyses) await ctx.db.delete(a._id);

    // Delete jobs
    const jobs = await ctx.db.query("jobTrackers").withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject)).collect();
    for (const j of jobs) await ctx.db.delete(j._id);

    // Delete user
    await ctx.db.delete(user._id);

    return true;
  },
});
