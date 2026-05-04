import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { callOpenRouter } from "./lib/openrouter";
import { validateAiResponse } from "./lib/validators";

export const getMyAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return ctx.db
      .query("analyses")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const analysisId = await ctx.db.insert("analyses", {
      userId: user._id,
      clerkId: identity.subject,
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
      userId: identity.subject,
      action: "analysis_created",
      resourceId: analysisId,
      timestamp: Date.now(),
    });

    return analysisId;
  },
});

export const runAnalysis = action({
  args: {
    analysisId: v.id("analyses"),
    resumeText: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    type: v.union(
      v.literal("resume_review"),
      v.literal("job_match"),
      v.literal("portfolio_audit"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const rateLimitRes = await ctx.runMutation(
      internal.lib.rateLimiter.consumeRateLimit,
      {
        userId: identity.subject,
        resource: "analysis",
        maxCount: 10,
        windowMs: 3600000,
      },
    );

    if (!rateLimitRes.success) {
      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "failed",
        errorMessage: "Rate limit exceeded. Try again later.",
      });
      throw new Error("Rate limit exceeded.");
    }

    try {
      const systemPrompt = `You are an expert career coach with 15 years experience.
Return ONLY valid JSON in a markdown code block.
The JSON MUST follow this schema exactly:
{
  "score": number (0-100),
  "summary": "string summary of analysis",
  "strengths": ["array of strings"],
  "weaknesses": ["array of strings"],
  "suggestions": ["array of strings"]
  ${args.type === "job_match" ? ', "missingSkills": ["array of strings"]' : ""}
  ${args.type === "portfolio_audit" ? ', "improvedDescriptions": ["array of strings"]' : ""}
}`;
      let userPrompt = "";

      if (args.type === "resume_review") {
        userPrompt = `Analyze this resume:\n\n${args.resumeText?.slice(0, 8000) ?? "No resume text provided."}`;
      } else if (args.type === "job_match") {
        userPrompt = `Compare this resume against the job description.\n\nResume:\n${args.resumeText?.slice(0, 8000) ?? "Empty resume"}\n\nJob Description:\n${args.jobDescription?.slice(0, 4000) ?? "Empty job description"}`;
      } else if (args.type === "portfolio_audit") {
        userPrompt = `Audit this portfolio URL: ${args.portfolioUrl ?? "No URL provided"}`;
      }

      const rawResult = await callOpenRouter(systemPrompt, userPrompt);
      const validatedResult = validateAiResponse(args.type, rawResult);

      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "completed",
        result: validatedResult,
      });

      return validatedResult;
    } catch (err: unknown) {
      console.error(err);
      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "failed",
        errorMessage: "AI Analysis failed.",
      });
      throw new Error("Analysis failed");
    }
  },
});
