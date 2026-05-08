import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    isPro: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  resumes: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    title: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    extractedText: v.optional(v.string()),
    fileType: v.union(
      v.literal("pdf"),
      v.literal("txt"),
      v.literal("md"),
      v.literal("docx"),
    ),
    fileSize: v.number(),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_clerk_id", ["clerkId", "createdAt"])
    .index("by_storage", ["fileStorageId"]),

  analyses: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    resumeId: v.optional(v.id("resumes")),
    portfolioUrl: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    type: v.union(
      v.literal("resume_review"),
      v.literal("job_match"),
      v.literal("portfolio_audit"),
    ),
    aiModel: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    result: v.optional(
      v.object({
        score: v.number(),
        summary: v.string(),
        strengths: v.array(v.string()),
        weaknesses: v.array(v.string()),
        suggestions: v.array(v.string()),
        missingSkills: v.optional(v.array(v.string())),
        improvedDescriptions: v.optional(v.array(v.string())),
      }),
    ),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_clerk_id", ["clerkId", "createdAt"])
    .index("by_resume", ["resumeId", "createdAt"])
    .index("by_status", ["status", "createdAt"]),

  jobTrackers: defineTable({
    userId: v.id("users"),
    clerkId: v.string(),
    company: v.string(),
    role: v.string(),
    jobUrl: v.optional(v.string()),
    status: v.union(
      v.literal("wishlist"),
      v.literal("applied"),
      v.literal("phone_screen"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("rejected"),
      v.literal("accepted"),
    ),
    salaryRange: v.optional(v.string()),
    notes: v.optional(v.string()),
    appliedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_clerk_id", ["clerkId", "createdAt"])
    .index("by_status", ["userId", "status"]),

  guestSessions: defineTable({
    ipHash: v.string(),
    sessionToken: v.string(),
    analysisCount: v.number(),
    maxAnalyses: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["sessionToken"])
    .index("by_ip", ["ipHash"]),

  guestAnalyses: defineTable({
    guestSessionId: v.id("guestSessions"),
    type: v.union(
      v.literal("resume_review"),
      v.literal("job_match"),
      v.literal("portfolio_audit"),
    ),
    inputData: v.string(),
    result: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_session", ["guestSessionId", "createdAt"]),

  auditLogs: defineTable({
    userId: v.optional(v.string()),
    guestSessionId: v.optional(v.id("guestSessions")),
    action: v.union(
      v.literal("user_created"),
      v.literal("resume_uploaded"),
      v.literal("analysis_created"),
      v.literal("analysis_completed"),
      v.literal("analysis_failed"),
      v.literal("job_tracker_created"),
      v.literal("job_tracker_updated"),
      v.literal("job_tracker_deleted"),
      v.literal("guest_analysis_created"),
      v.literal("login"),
      v.literal("logout"),
      v.literal("data_export_requested"),
      v.literal("rate_limit_hit"),
    ),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId", "timestamp"])
    .index("by_action", ["action", "timestamp"]),

  rateLimits: defineTable({
    userId: v.string(),
    resource: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_user_resource", ["userId", "resource"]),

  analysisCache: defineTable({
    contentHash: v.string(), // SHA-256 or similar hash of the input text
    result: v.any(),
    type: v.string(),
    createdAt: v.number(),
  }).index("by_hash", ["contentHash"]),
});
