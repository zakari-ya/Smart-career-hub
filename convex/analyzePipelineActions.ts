"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { callOpenRouter } from "./lib/openrouter";
import { validateExtraction } from "./lib/parser";

/**
 * Phase 1: Instant Analysis
 * Handles structure validation and basic formatting checks.
 */
export const triggerPhase1 = internalAction({
  args: {
    pipelineId: v.id("analysisPipeline"),
  },
  handler: async (ctx, args) => {
    const pipeline = await ctx.runQuery(internal.analyzePipeline.getPipelineInternal, {
      pipelineId: args.pipelineId,
    });
    if (!pipeline) throw new Error("Pipeline not found");

    const resume = await ctx.runQuery(internal.resumes.getResumeInternal, {
      resumeId: pipeline.resumeId,
    });
    
    if (!resume || !resume.extractedText) {
      await ctx.runMutation(internal.analyzePipeline.updatePhase, {
        pipelineId: args.pipelineId,
        phase: "phase1",
        status: "failed",
        error: "No extracted text found for analysis.",
      });
      return;
    }

    try {
      const validation = validateExtraction(resume.extractedText);

      if (!validation.valid) {
        await ctx.runMutation(internal.analyzePipeline.updatePhase, {
          pipelineId: args.pipelineId,
          phase: "phase1",
          status: "failed",
          error: validation.error || "Structure validation failed.",
        });
      } else {
        await ctx.runMutation(internal.analyzePipeline.updatePhase, {
          pipelineId: args.pipelineId,
          phase: "phase1",
          status: "completed",
          data: {
            structureOk: true,
            extractionQuality: "good",
            wordCount: resume.extractedText.split(/\s+/).length,
          },
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.analyzePipeline.updatePhase, {
        pipelineId: args.pipelineId,
        phase: "phase1",
        status: "failed",
        error: "Phase 1 analysis failed internally.",
      });
    }
  },
});

/**
 * Phase 2: Fast Analysis
 * Handles keyword extraction, skills taxonomy, and preliminary scoring.
 */
export const triggerPhase2 = internalAction({
  args: {
    pipelineId: v.id("analysisPipeline"),
  },
  handler: async (ctx, args) => {
    const pipeline = await ctx.runQuery(internal.analyzePipeline.getPipelineInternal, {
      pipelineId: args.pipelineId,
    });
    if (!pipeline) throw new Error("Pipeline not found");

    const resume = await ctx.runQuery(internal.resumes.getResumeInternal, {
      resumeId: pipeline.resumeId,
    });
    
    if (!resume || !resume.extractedText) return;

    try {
      const systemPrompt = "You are a senior technical recruiter. Perform a fast initial scan of this resume. Extract key skills and give a preliminary score. Be honest. Do not inflate scores. Use second person.";
      const userPrompt = `Analyze this resume and return JSON ONLY:
      {
        "score": number (0-100),
        "tier": "WEAK" | "AVERAGE" | "STRONG" | "EXCEPTIONAL",
        "topSkills": string[],
        "preliminaryFeedback": "One sentence honest feedback."
      }
      
      Resume: ${resume.extractedText.substring(0, 4000)}`;

      const result = await callOpenRouter(systemPrompt, userPrompt);
      
      await ctx.runMutation(internal.analyzePipeline.updatePhase, {
        pipelineId: args.pipelineId,
        phase: "phase2",
        status: "completed",
        data: result,
      });
    } catch (error) {
      console.error("Phase 2 failed:", error);
      await ctx.runMutation(internal.analyzePipeline.updatePhase, {
        pipelineId: args.pipelineId,
        phase: "phase2",
        status: "failed",
        error: "Phase 2 analysis failed.",
      });
    }
  },
});

/**
 * Phase 3: Deep Analysis
 * Handles complex AI semantic analysis, bullet rewriting, and honest assessment.
 */
export const triggerPhase3 = internalAction({
  args: {
    pipelineId: v.id("analysisPipeline"),
  },
  handler: async (ctx, args) => {
    const pipeline = await ctx.runQuery(internal.analyzePipeline.getPipelineInternal, {
      pipelineId: args.pipelineId,
    });
    if (!pipeline) throw new Error("Pipeline not found");

    const resume = await ctx.runQuery(internal.resumes.getResumeInternal, {
      resumeId: pipeline.resumeId,
    });
    
    if (!resume || !resume.extractedText) return;

    try {
      const systemPrompt = "You are an elite executive recruiter. Perform a deep, honest analysis of this resume. Use the STAR method to evaluate bullets. Be honest. Do not inflate scores. Use second person.";
      const userPrompt = `Analyze this resume deeply and return JSON ONLY:
      {
        "detailedAssessment": "2-3 sentences speaking directly to the user.",
        "strengths": string[],
        "weaknesses": string[],
        "suggestions": string[],
        "bulletRewrites": Array<{ "original": string, "rewritten": string, "reason": string }>
      }
      
      Resume: ${resume.extractedText.substring(0, 8000)}`;

      const result = await callOpenRouter(systemPrompt, userPrompt);
      
      await ctx.runMutation(internal.analyzePipeline.updatePhase, {
        pipelineId: args.pipelineId,
        phase: "phase3",
        status: "completed",
        data: result,
      });
    } catch (error) {
      console.error("Phase 3 failed:", error);
      await ctx.runMutation(internal.analyzePipeline.updatePhase, {
        pipelineId: args.pipelineId,
        phase: "phase3",
        status: "failed",
        error: "Phase 3 deep analysis failed.",
      });
    }
  },
});
