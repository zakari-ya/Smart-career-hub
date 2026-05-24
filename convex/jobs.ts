import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedIdentity, getAuthUserId } from "./lib/auth";

export const getMyJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthenticatedIdentity(ctx);
    const authUserId = getAuthUserId(identity);

    return ctx.db
      .query("jobTrackers")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .collect();
  },
});

export const createJobTracker = mutation({
  args: {
    company: v.string(),
    role: v.string(),
    jobUrl: v.optional(v.string()),
    status: v.union(
      v.literal("wishlist"), v.literal("applied"), v.literal("phone_screen"),
      v.literal("interview"), v.literal("offer"), v.literal("rejected"), v.literal("accepted")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedIdentity(ctx);
    const authUserId = getAuthUserId(identity);

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .first();
    if (!user) throw new Error("User not found");

    const jobId = await ctx.db.insert("jobTrackers", {
      userId: user._id,
      authUserId,
      company: args.company,
      role: args.role,
      ...(args.jobUrl !== undefined ? { jobUrl: args.jobUrl } : {}),
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: authUserId,
      action: "job_tracker_created",
      resourceId: jobId,
      timestamp: Date.now(),
    });

    return jobId;
  },
});
