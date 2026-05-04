"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { callOpenRouter } from "./lib/openrouter";
import { validateExtraction } from "./lib/parser";

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

    // Rate limit check
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
      return { error: "Rate limit exceeded. Try again later." };
    }

    try {
      let analysisText = args.resumeText || "";

      // 1. Fetch text from storage if not provided directly
      if (!analysisText && args.type !== "portfolio_audit") {
        const analysisRecord = await ctx.runQuery(
          internal.analyses.getAnalysisInternal,
          { analysisId: args.analysisId },
        );
        const resumeId = analysisRecord?.resumeId;

        if (resumeId) {
          const resume = await ctx.runQuery(internal.resumes.getResumeInternal, {
            resumeId,
          });
          if (resume) {
            if (resume.extractedText) {
              analysisText = resume.extractedText;
            } else if (resume.fileStorageId) {
              const file = await ctx.storage.get(resume.fileStorageId);
              if (file) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const mimeType =
                  resume.fileType === "pdf"
                    ? "application/pdf"
                    : resume.fileType === "docx"
                      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      : "text/plain";

                const { extractText } = await import("./lib/parser");
                analysisText = await extractText(buffer, mimeType);

                // Cache it
                await ctx.runMutation(api.resumes.updateExtractedText, {
                  resumeId,
                  text: analysisText,
                });
              }
            }
          }
        }
      }

      // 2. CRITICAL: Validate Extraction Quality (Substep 5A)
      if (args.type !== "portfolio_audit") {
        const validation = validateExtraction(analysisText);
        if (!validation.valid) {
          await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
            analysisId: args.analysisId,
            status: "failed",
            ...(validation.error ? { errorMessage: validation.error } : {}),
          });
          return { error: validation.error };
        }
      }

      // 3. Assemble Prompts (Substeps 5B & 5C)
      let systemPrompt = "";
      let userPrompt = "";

      if (args.type === "resume_review") {
        systemPrompt = "You are a senior technical recruiter and resume strategist with 15 years of experience at top-tier companies. You have reviewed over 10,000 resumes. You are direct, honest, and constructive. You speak to the user in second person ('your resume', 'you should'). You never sugarcoat weaknesses. You never hallucinate content that is not in the provided text.";
        userPrompt = `Analyze the following resume text and provide a detailed, honest review. Speak directly to the user as 'you'.

--- EXTRACTED RESUME TEXT START ---
${analysisText}
--- EXTRACTED RESUME TEXT END ---

RULES:
1. ONLY analyze the text between the markers. If it seems incomplete, say: 'The extracted text appears incomplete. I can only analyze what was provided.'
2. Do NOT invent skills, jobs, or degrees that are not in the text.
3. Be honest. If the resume is weak, say it is weak and explain why. Do not give false hope.
4. Use second person: 'Your resume...', 'You should...', 'Your experience section...'
5. Scores must be realistic. A resume with no metrics, no keywords, and formatting issues should score below 50.

OUTPUT FORMAT — Return ONLY a valid JSON object. No markdown, no explanations outside JSON.

{
  "extractionQuality": "good" | "incomplete" | "corrupted",
  "overallATSScore": number (0-100),
  "verdict": "weak" | "average" | "strong",
  "verdictReason": "One honest sentence explaining why.",
  "sections": {
    "contactInfo": {
      "score": number (0-100),
      "feedback": "Talk to the user directly. What's missing or wrong?"
    },
    "summary": {
      "score": number (0-100),
      "feedback": "Direct feedback to the user."
    },
    "experience": {
      "score": number (0-100),
      "feedback": "Direct feedback. Mention STAR method and metrics."
    },
    "skills": {
      "score": number (0-100),
      "feedback": "Direct feedback on relevance and categorization."
    },
    "education": {
      "score": number (0-100),
      "feedback": "Direct feedback."
    },
    "formatting": {
      "score": number (0-100),
      "feedback": "Direct feedback on length, fonts, whitespace."
    }
  },
  "missingKeywords": ["keyword1", "keyword2"],
  "top3Actions": [
    "Specific, actionable improvement 1",
    "Specific, actionable improvement 2", 
    "Specific, actionable improvement 3"
  ],
  "honestAssessment": "Write 2-3 sentences speaking directly to the user. Be encouraging but realistic. Example: 'Your resume has a solid foundation, but it lacks measurable impact. Hiring managers want to see numbers and outcomes, not just responsibilities. With the changes above, you can significantly improve your callback rate.'"
}

EXAMPLE OF HONEST SCORING:
- A resume with no metrics, vague bullet points, and missing contact info = 35/100, verdict: "weak"
- A resume with good structure but no keywords for the target role = 55/100, verdict: "average"  
- A resume with metrics, clear progression, and strong keywords = 85/100, verdict: "strong"

Now analyze the resume above and return ONLY the JSON.`;
      } else if (args.type === "job_match") {
        systemPrompt = "You are a senior technical recruiter and career strategist. You specialize in matching candidates to job descriptions with brutal honesty. You speak directly to the user ('you', 'your skills'). You never inflate match scores to be nice. If the user is unqualified, you say so clearly and explain what they need to learn.";
        userPrompt = `Compare the user's resume against the job description. Be honest about the match.

--- USER RESUME TEXT START ---
${analysisText}
--- USER RESUME TEXT END ---

--- JOB DESCRIPTION START ---
${args.jobDescription || "No job description provided."}
--- JOB DESCRIPTION END ---

RULES:
1. ONLY use skills and experience found in the resume text. Do NOT invent qualifications.
2. If the resume text is corrupted or incomplete, set extractionQuality to "bad" and stop.
3. Speak in second person: 'You have...', 'You are missing...', 'Your experience...'
4. The match score must reflect reality. A junior resume matched to a senior role should be under 30.
5. Be constructive but direct. False hope hurts the user's job search.

OUTPUT FORMAT — Return ONLY valid JSON. No markdown.

{
  "extractionQuality": "good" | "incomplete" | "corrupted",
  "matchScore": number (0-100),
  "matchVerdict": "low" | "medium" | "high",
  "matchReason": "One honest sentence: 'Your match is low because...'",
  "skillsAnalysis": {
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "transferableSkills": ["skill5", "skill6"]
  },
  "experienceGap": "Direct feedback on years/seniority mismatch.",
  "resumeTailoring": [
    "Specific bullet point to add or modify",
    "Keyword to include in your skills section", 
    "Section to restructure"
  ],
  "realisticNextSteps": [
    "Actionable step 1 (e.g., 'Learn AWS Lambda — this is required for 80% of similar roles')",
    "Actionable step 2",
    "Actionable step 3"
  ],
  "honestAssessment": "2-3 sentences speaking directly to the user. Example: 'You currently match about 40% of this role's requirements. While your frontend skills are solid, this position requires backend experience you don't yet have. Focus on learning Node.js and database design before applying to similar roles.'"
}

EXAMPLE OF HONEST SCORING:
- Resume has 2/10 required skills = 20/100, verdict: "low"
- Resume has 6/10 required skills but missing seniority = 55/100, verdict: "medium"
- Resume has 9/10 required skills + relevant experience = 88/100, verdict: "high"

Now analyze and return ONLY the JSON.`;
      } else if (args.type === "portfolio_audit") {
        // Fallback for portfolio audit
        systemPrompt = "You are a senior technical recruiter and engineering manager. Audit this GitHub portfolio summary. Output ONLY valid JSON.";
        userPrompt = `Audit this GitHub portfolio summary:

--- GITHUB PROFILE SUMMARY START ---
${analysisText || args.portfolioUrl}
--- GITHUB PROFILE SUMMARY END ---

RULES:
1. Be constructive but direct.
2. Provide actionable advice for improving their open-source presence.

OUTPUT FORMAT — Return ONLY a valid JSON object. No markdown, no explanations outside JSON.
{
  "score": number (0-100),
  "summary": "Overall assessment...",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;
      }

      // 4. Call AI & Handle Response (Substep 5D)
      const rawResult = await callOpenRouter(systemPrompt, userPrompt);
      let parsedResult;

      try {
        parsedResult = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
      } catch (e) {
        console.error("Failed to parse AI response:", rawResult);
        await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
          analysisId: args.analysisId,
          status: "failed",
          errorMessage: "Analysis format error. Please try again.",
        });
        return { error: "Analysis format error. Please try again." };
      }

      // 5. Success -> Update DB
      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "completed",
        result: parsedResult,
      });

      return parsedResult;
    } catch (err: unknown) {
      console.error("[runAnalysis Error]:", err);
      await ctx.runMutation(internal.analyses.updateAnalysisStatus, {
        analysisId: args.analysisId,
        status: "failed",
        errorMessage: "AI service temporarily unavailable.",
      });
      return { error: "AI service temporarily unavailable." };
    }
  },
});
