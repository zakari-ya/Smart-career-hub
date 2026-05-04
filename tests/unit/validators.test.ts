import { describe, it, expect } from "vitest";
import { validateAiResponse } from "../../convex/lib/validators";

describe("AI Response Validators", () => {
  const baseValidData = {
    score: 85,
    summary: "A strong resume.",
    strengths: ["Great experience", "Good formatting"],
    weaknesses: ["Lacks metrics"],
    suggestions: ["Add more numbers to bullet points"],
  };

  it("should validate a correct resume_review response", () => {
    const result = validateAiResponse("resume_review", baseValidData);
    expect(result).toEqual(baseValidData);
  });

  it("should fail validation for resume_review if score is out of bounds", () => {
    const invalidData = { ...baseValidData, score: 105 };
    expect(() => validateAiResponse("resume_review", invalidData)).toThrow();
  });

  it("should fail validation for resume_review if a required field is missing", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { summary, ...invalidData } = baseValidData;
    expect(() => validateAiResponse("resume_review", invalidData)).toThrow();
  });

  it("should validate a correct job_match response", () => {
    const jobMatchData = {
      ...baseValidData,
      missingSkills: ["Docker", "Kubernetes"],
    };
    const result = validateAiResponse("job_match", jobMatchData);
    expect(result).toEqual(jobMatchData);
  });

  it("should fail validation for job_match if missingSkills is missing", () => {
    expect(() => validateAiResponse("job_match", baseValidData)).toThrow();
  });

  it("should validate a correct portfolio_audit response", () => {
    const portfolioData = {
      ...baseValidData,
      improvedDescriptions: ["Improved project 1 description."],
    };
    const result = validateAiResponse("portfolio_audit", portfolioData);
    expect(result).toEqual(portfolioData);
  });

  it("should fail validation for portfolio_audit if improvedDescriptions is missing", () => {
    expect(() => validateAiResponse("portfolio_audit", baseValidData)).toThrow();
  });

  it("should throw error for unknown analysis type", () => {
    expect(() => validateAiResponse("unknown_type", baseValidData)).toThrow("Unknown analysis type: unknown_type");
  });
});
