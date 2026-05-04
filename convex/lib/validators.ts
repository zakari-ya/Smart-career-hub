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
