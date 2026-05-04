import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyResumes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // Per RULE-S4: return null (not throw) for queries — reactive queries can
    // fire before auth token is established; null signals "not ready yet" to
    // the client without crashing the render tree.
    if (!identity) return null;

    return ctx.db
      .query("resumes")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .collect();
  },
});

export const createResume = mutation({
  args: {
    title: v.string(),
    fileStorageId: v.optional(v.id("_storage")),
    extractedText: v.optional(v.string()),
    fileType: v.union(v.literal("pdf"), v.literal("txt"), v.literal("md")),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const resumeId = await ctx.db.insert("resumes", {
      userId: user._id,
      clerkId: identity.subject,
      title: args.title,
      ...(args.fileStorageId !== undefined
        ? { fileStorageId: args.fileStorageId }
        : {}),
      ...(args.extractedText !== undefined
        ? { extractedText: args.extractedText }
        : {}),
      fileType: args.fileType,
      fileSize: args.fileSize,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: identity.subject,
      action: "resume_uploaded",
      resourceId: resumeId,
      timestamp: Date.now(),
    });

    return resumeId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});
