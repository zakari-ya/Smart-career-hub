import { z } from "zod";

export const aiResponseBaseSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const resumeReviewSchema = aiResponseBaseSchema;

export const jobMatchSchema = aiResponseBaseSchema.extend({
  missingSkills: z.array(z.string()),
});

export const portfolioAuditSchema = aiResponseBaseSchema.extend({
  improvedDescriptions: z.array(z.string()),
});

const resumeReviewRawSchema = z.object({
  overallATSScore: z.number().min(0).max(100),
  verdictReason: z.string().optional(),
  honestAssessment: z.string().optional(),
  top3Actions: z.array(z.string()).optional(),
  missingKeywords: z.array(z.string()).optional(),
});

const jobMatchRawSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchReason: z.string().optional(),
  honestAssessment: z.string().optional(),
  skillsAnalysis: z
    .object({
      matchedSkills: z.array(z.string()).optional(),
      missingSkills: z.array(z.string()).optional(),
    })
    .optional(),
  experienceGap: z.string().optional(),
  resumeTailoring: z.array(z.string()).optional(),
  realisticNextSteps: z.array(z.string()).optional(),
});

// A union for general validation based on type
export const validateAiResponse = (type: string, data: unknown) => {
  switch (type) {
    case "resume_review":
      return resumeReviewSchema.parse(data);
    case "job_match":
      return jobMatchSchema.parse(data);
    case "portfolio_audit":
      return portfolioAuditSchema.parse(data);
    default:
      throw new Error(`Unknown analysis type: ${type}`);
  }
};

export function normalizeStoredAnalysisResult(type: string, data: unknown) {
  if (type === "resume_review") {
    const parsed = resumeReviewRawSchema.parse(data);
    return validateAiResponse(type, {
      score: parsed.overallATSScore,
      summary:
        parsed.honestAssessment ??
        parsed.verdictReason ??
        "Resume review completed.",
      strengths: [],
      weaknesses: parsed.missingKeywords ?? [],
      suggestions: parsed.top3Actions ?? [],
    });
  }

  if (type === "job_match") {
    const parsed = jobMatchRawSchema.parse(data);
    return validateAiResponse(type, {
      score: parsed.matchScore,
      summary:
        parsed.honestAssessment ?? parsed.matchReason ?? "Job match completed.",
      strengths: parsed.skillsAnalysis?.matchedSkills ?? [],
      weaknesses: [
        ...(parsed.skillsAnalysis?.missingSkills ?? []),
        ...(parsed.experienceGap ? [parsed.experienceGap] : []),
      ],
      suggestions: [
        ...(parsed.resumeTailoring ?? []),
        ...(parsed.realisticNextSteps ?? []),
      ],
      missingSkills: parsed.skillsAnalysis?.missingSkills ?? [],
    });
  }

  return validateAiResponse(type, data);
}
