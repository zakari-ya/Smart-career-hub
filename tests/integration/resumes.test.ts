import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../../convex/schema";
import { api } from "../../convex/_generated/api";

// We need to import all convex modules for convex-test
const modules = import.meta.glob("../../convex/**/*.ts");

describe("Resumes Integration Tests", () => {
  it("should return null for unauthenticated users (no auth token)", async () => {
    // getMyResumes returns null (not throws) for unauthenticated callers —
    // both are valid per RULE-S4: "Return null or throw".
    // Returning null is safer for reactive queries that run before auth settles.
    const t = convexTest(schema, modules);
    const result = await t.query(api.resumes.getMyResumes, {});
    expect(result).toBeNull();
  });

  it("should allow an authenticated user to fetch their own resumes", async () => {
    const t = convexTest(schema, modules);
    
    // Create a mock user in the DB
    const userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        clerkId: "user_123",
        email: "test@example.com",
        name: "Test User",
        role: "user",
        isPro: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    // Mock authentication
    const tAuthed = t.withIdentity({ subject: "user_123" });

    // Fetch resumes (should be empty initially)
    const resumes = await tAuthed.query(api.resumes.getMyResumes, {});
    expect(resumes).toEqual([]);

    // Insert a resume directly via DB to test the query
    await t.run(async (ctx) => {
      await ctx.db.insert("resumes", {
        userId,
        clerkId: "user_123",
        title: "Test Resume",
        fileType: "pdf",
        fileSize: 1024,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    // Fetch resumes again — authenticated, so result is an array (not null)
    const resumesAfter = await tAuthed.query(api.resumes.getMyResumes, {});
    expect(resumesAfter).not.toBeNull();
    expect(resumesAfter).toHaveLength(1);
    // resumesAfter is guaranteed non-null by the assertion above
    const firstResume = (resumesAfter as NonNullable<typeof resumesAfter>)[0];
    expect(firstResume?.title).toBe("Test Resume");
  });

  it("should prevent BOLA: User A cannot see User B's resumes", async () => {
    const t = convexTest(schema, modules);
    
    // Create User A
    const userAId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        clerkId: "user_A",
        email: "a@example.com",
        name: "User A",
        role: "user",
        isPro: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    // Create User B
    await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        clerkId: "user_B",
        email: "b@example.com",
        name: "User B",
        role: "user",
        isPro: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    // Insert a resume for User A
    await t.run(async (ctx) => {
      await ctx.db.insert("resumes", {
        userId: userAId,
        clerkId: "user_A",
        title: "Resume A",
        fileType: "pdf",
        fileSize: 1024,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });

    // Authenticate as User B
    const tAuthedB = t.withIdentity({ subject: "user_B" });

    // User B should not see User A's resume — BOLA isolation check
    const resumesB = await tAuthedB.query(api.resumes.getMyResumes, {});
    // Authenticated as User B, so result is an array (not null)
    expect(resumesB).not.toBeNull();
    expect(resumesB).toHaveLength(0);
  });
});
