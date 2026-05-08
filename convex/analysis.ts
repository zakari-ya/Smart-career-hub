"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { callOpenRouter } from "./lib/openrouter";
import { createHash } from "crypto";

/**
 * PHASE 2: Background AI Analysis
 * Receives validated text and performs the heavy LLM work.
 * Optimized with truncation, deterministic parameters, and caching.
 */
export const analyzeResume = action({
  args: {
    extractedText: v.string(),
    jobDescription: v.optional(v.string()),
    analysisType: v.union(v.literal("resume"), v.literal("match")),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    analysis?: unknown;
    cached?: boolean;
    error?: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 1. TRUNCATION: Keep input within reasonable limits to save tokens and improve speed
    const truncatedResume = args.extractedText.slice(0, 8000);
    const truncatedJD = args.jobDescription?.slice(0, 4000) || "";

    // 2. CACHING: Check if this exact analysis has been done before
    const contentHash = createHash("sha256")
      .update(`${args.analysisType}-${truncatedResume}-${truncatedJD}`)
      .digest("hex");

    const cachedResult = (await ctx.runQuery(
      internal.analyses.getCachedResult,
      {
        contentHash,
      },
    )) as { result: unknown } | null;

    if (cachedResult) {
      console.log(
        "[Cache Hit] Returning existing analysis for hash:",
        contentHash,
      );
      return { success: true, analysis: cachedResult.result, cached: true };
    }

    // Rate limit check (only if not a cache hit)
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
      return {
        success: false,
        error: "Rate limit exceeded. Try again in an hour.",
      };
    }

    try {
      let systemPrompt = "";
      let userPrompt = "";

      if (args.analysisType === "resume") {
        systemPrompt =
          "You are a senior technical recruiter and resume strategist. Return ONLY valid JSON.";
        userPrompt = `Analyze the following resume text. Speak directly to the user as 'you'.

--- EXTRACTED RESUME TEXT ---
${truncatedResume}
--- END ---

RULES:
1. ONLY analyze the text provided.
2. Be honest. If the resume is weak, score it accordingly.
3. Use second person: 'Your resume...', 'You should...'

OUTPUT JSON FORMAT:
{
  "overallATSScore": number (0-100),
  "verdict": "weak" | "average" | "strong",
  "verdictReason": "string",
  "sections": {
    "contactInfo": { "score": number, "feedback": "string" },
    "summary": { "score": number, "feedback": "string" },
    "experience": { "score": number, "feedback": "string" },
    "skills": { "score": number, "feedback": "string" },
    "education": { "score": number, "feedback": "string" },
    "formatting": { "score": number, "feedback": "string" }
  },
  "missingKeywords": ["string"],
  "top3Actions": ["string"],
  "honestAssessment": "string"
}`;
      } else {
        systemPrompt =
          "You are a senior technical recruiter matching resumes to job descriptions. Return ONLY valid JSON.";
        userPrompt = `Compare the resume to the job description. Be honest.

--- RESUME ---
${truncatedResume}

--- JOB DESCRIPTION ---
${truncatedJD}

RULES:
1. ONLY use skills found in the resume.
2. Match score must reflect reality.

OUTPUT JSON FORMAT:
{
  "matchScore": number (0-100),
  "matchVerdict": "low" | "medium" | "high",
  "matchReason": "string",
  "skillsAnalysis": {
    "matchedSkills": ["string"],
    "missingSkills": ["string"],
    "transferableSkills": ["string"]
  },
  "experienceGap": "string",
  "resumeTailoring": ["string"],
  "realisticNextSteps": ["string"],
  "honestAssessment": "string"
}`;
      }

      // Call OpenRouter with optimized params (temp 0.2, json_object)
      const analysis = await callOpenRouter(systemPrompt, userPrompt);

      // Save to cache
      await ctx.runMutation(internal.analyses.setCachedResult, {
        contentHash,
        result: analysis,
        type: args.analysisType,
      });

      return {
        success: true,
        analysis,
      };
    } catch (err) {
      console.error("[Analysis Action Error]:", err);
      return {
        success: false,
        error: "AI analysis failed. Our recruiters are temporarily offline.",
      };
    }
  },
});
