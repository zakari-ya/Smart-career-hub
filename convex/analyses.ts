import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedIdentity, getAuthUserId } from "./lib/auth";

export const getMyAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthenticatedIdentity(ctx);
    const authUserId = getAuthUserId(identity);

    return ctx.db
      .query("analyses")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .collect();
  },
});

export const updateAnalysisStatus = internalMutation({
  args: {
    analysisId: v.id("analyses"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    result: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.analysisId, {
      status: args.status,
      result: args.result,
      errorMessage: args.errorMessage,
      completedAt: Date.now(),
    });
  },
});

export const createAnalysisRecord = mutation({
  args: {
    resumeId: v.optional(v.id("resumes")),
    portfolioUrl: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    type: v.union(
      v.literal("resume_review"),
      v.literal("job_match"),
      v.literal("portfolio_audit"),
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

    const analysisId = await ctx.db.insert("analyses", {
      userId: user._id,
      authUserId,
      ...(args.resumeId !== undefined ? { resumeId: args.resumeId } : {}),
      ...(args.jobDescription !== undefined
        ? { jobDescription: args.jobDescription }
        : {}),
      ...(args.portfolioUrl !== undefined
        ? { portfolioUrl: args.portfolioUrl }
        : {}),
      type: args.type,
      aiModel: "openai/gpt-oss-120b:free",
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: authUserId,
      action: "analysis_created",
      resourceId: analysisId,
      timestamp: Date.now(),
    });

    return analysisId;
  },
});

export const getAnalysisInternal = internalQuery({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.analysisId);
  },
});

export const getCachedResult = internalQuery({
  args: { contentHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysisCache")
      .withIndex("by_hash", (q) => q.eq("contentHash", args.contentHash))
      .first();
  },
});

export const setCachedResult = internalMutation({
  args: {
    contentHash: v.string(),
    result: v.any(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analysisCache", {
      contentHash: args.contentHash,
      result: args.result,
      type: args.type,
      createdAt: Date.now(),
    });
  },
});
