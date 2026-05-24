import { mutation } from "./_generated/server";
import { getAuthenticatedIdentity, getAuthUserId } from "./lib/auth";
import { betterAuthApi } from "./betterAuth";

export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthenticatedIdentity(ctx);
    const authUserId = getAuthUserId(identity);
    const authSubject = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .first();
    if (!user) throw new Error("User not found");

    // Delete resumes
    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .collect();
    for (const r of resumes) {
      if (r.fileStorageId) await ctx.storage.delete(r.fileStorageId);
      await ctx.db.delete(r._id);
    }

    // Delete analyses
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .collect();
    for (const a of analyses) await ctx.db.delete(a._id);

    // Delete jobs
    const jobs = await ctx.db
      .query("jobTrackers")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .collect();
    for (const j of jobs) await ctx.db.delete(j._id);

    // Delete user
    await ctx.db.delete(user._id);

    await ctx.runMutation(betterAuthApi.adapter.deleteMany, {
      input: {
        model: "session",
        where: [{ field: "userId", value: authSubject }],
      },
      paginationOpts: { cursor: null, numItems: 200 },
    });
    await ctx.runMutation(betterAuthApi.adapter.deleteMany, {
      input: {
        model: "account",
        where: [{ field: "userId", value: authSubject }],
      },
      paginationOpts: { cursor: null, numItems: 200 },
    });
    await ctx.runMutation(betterAuthApi.adapter.deleteOne, {
      input: {
        model: "user",
        where: [{ field: "_id", value: authSubject }],
      },
    });

    return true;
  },
});
