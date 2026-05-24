import { mutation, query } from "./_generated/server";
import { getAuthenticatedIdentity, getAuthUserId } from "./lib/auth";
import { betterAuthComponent } from "./betterAuth";

export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuthenticatedIdentity(ctx);
    const authUserId = getAuthUserId(identity);
    const authUser = await betterAuthComponent.safeGetAuthUser(ctx);

    if (!authUser?.email) {
      throw new Error("Unauthorized");
    }

    const displayName =
      authUser.name ??
      authUser.email.split("@")[0] ??
      "User";

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        authUserId,
        email: authUser.email,
        name: displayName,
        avatarUrl: authUser.image ?? undefined,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      authUserId,
      email: authUser.email,
      name: displayName,
      ...(authUser.image ? { avatarUrl: authUser.image } : {}),
      role: "user",
      isPro: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: authUserId,
      action: "user_created",
      timestamp: Date.now(),
    });

    return newUserId;
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const authUserId = getAuthUserId(identity);

    return await ctx.db
      .query("users")
      .withIndex("by_auth_user_id", (q) => q.eq("authUserId", authUserId))
      .first();
  },
});
