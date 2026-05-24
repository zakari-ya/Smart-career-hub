import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthenticatedIdentity, getAuthUserId } from "./lib/auth";
import { generateHash } from "./lib/hash";

/**
 * Initializes a new analysis pipeline for a specific resume.
 * Checks for cached results first.
 */
export const initPipeline = mutation({
  args: {
    resumeId: v.id("resumes"),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthenticatedIdentity(ctx);
    const authUserId = getAuthUserId(identity);

    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.authUserId !== authUserId) {
      throw new Error("Resume not found or access denied");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .unique();

    if (!user) throw new Error("User not found");

    // Task 2: Check Cache
    if (resume.extractedText) {
      const contentHash = generateHash(resume.extractedText);
      const cached = await ctx.db
        .query("analysisCache")
        .withIndex("by_hash", (q) => q.eq("contentHash", contentHash))
        .first();

      if (cached) {
        // Check if there's already a completed pipeline for this resume
        const existing = await ctx.db
          .query("analysisPipeline")
          .withIndex("by_resume", (q) => q.eq("resumeId", args.resumeId))
          .order("desc")
          .first();
        
        if (existing && existing.overallStatus === "completed") {
          return existing._id;
        }
      }
    }

    const pipelineId = await ctx.db.insert("analysisPipeline", {
      resumeId: args.resumeId,
      userId: user._id,
      authUserId,
      phase1: { status: "pending" },
      phase2: { status: "pending" },
      phase3: { status: "pending" },
      overallStatus: "processing",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.analyzePipelineActions.triggerPhase1, {
      pipelineId,
    });

    return pipelineId;
  },
});

/**
 * Updates the status and data of a specific phase in the pipeline.
 */
export const updatePhase = internalMutation({
  args: {
    pipelineId: v.id("analysisPipeline"),
    phase: v.union(v.literal("phase1"), v.literal("phase2"), v.literal("phase3")),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    data: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline) throw new Error("Pipeline not found");

    const phaseKey = args.phase as "phase1" | "phase2" | "phase3";
    const currentPhaseData = pipeline[phaseKey];
    const update: Record<string, unknown> = {
      [phaseKey]: {
        status: args.status,
        data: args.data ?? currentPhaseData.data,
        error: args.error,
        completedAt: args.status === "completed" ? Date.now() : currentPhaseData.completedAt,
      },
      updatedAt: Date.now(),
    };

    if (args.phase === "phase3" && args.status === "completed") {
      update.overallStatus = "completed";
      
      // Cache the final result if Phase 3 is successful
      const resume = await ctx.db.get(pipeline.resumeId);
      if (resume?.extractedText) {
        const contentHash = generateHash(resume.extractedText);
        await ctx.db.insert("analysisCache", {
          contentHash,
          result: {
            phase1: pipeline.phase1.data,
            phase2: pipeline.phase2.data,
            phase3: args.data,
          },
          type: "resume_review",
          createdAt: Date.now(),
        });
      }
    } else if (args.status === "failed") {
      update.overallStatus = "failed";
    }

    await ctx.db.patch(args.pipelineId, update);

    // Schedule next phases
    if (args.status === "completed") {
      if (args.phase === "phase1") {
        await ctx.scheduler.runAfter(0, internal.analyzePipelineActions.triggerPhase2, {
          pipelineId: args.pipelineId,
        });
      } else if (args.phase === "phase2") {
        await ctx.scheduler.runAfter(0, internal.analyzePipelineActions.triggerPhase3, {
          pipelineId: args.pipelineId,
        });
      }
    }
  },
});

export const getPipeline = query({
  args: { pipelineId: v.id("analysisPipeline") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const authUserId = getAuthUserId(identity);

    const pipeline = await ctx.db.get(args.pipelineId);
    if (!pipeline || pipeline.authUserId !== authUserId) {
      return null;
    }

    return pipeline;
  },
});

export const getPipelineInternal = internalQuery({
  args: { pipelineId: v.id("analysisPipeline") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.pipelineId);
  },
});

export const getPipelineByResume = query({
  args: { resumeId: v.id("resumes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const authUserId = getAuthUserId(identity);
    const resume = await ctx.db.get(args.resumeId);

    if (!resume || resume.authUserId !== authUserId) {
      return null;
    }

    return await ctx.db
      .query("analysisPipeline")
      .withIndex("by_resume", (q) => q.eq("resumeId", args.resumeId))
      .order("desc")
      .first();
  },
});
