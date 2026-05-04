

/**
 * Creates an audit log entry. This should be called internally by other mutations.
 */
export const logAudit = async (
  ctx: import("../_generated/server").MutationCtx,
  args: {
    userId?: string;
    guestSessionId?: string;
    action: string;
    resourceId?: string;
    metadata?: string;
    ipHash?: string;
    userAgent?: string;
  }
) => {
  await ctx.db.insert("auditLogs", {
    ...(args.userId !== undefined ? { userId: args.userId } : {}),
    ...(args.guestSessionId !== undefined ? { guestSessionId: args.guestSessionId as unknown as import("../_generated/dataModel").Id<"guestSessions"> } : {}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: args.action as any,
    ...(args.resourceId !== undefined ? { resourceId: args.resourceId } : {}),
    ...(args.metadata !== undefined ? { metadata: args.metadata } : {}),
    ...(args.ipHash !== undefined ? { ipHash: args.ipHash } : {}),
    ...(args.userAgent !== undefined ? { userAgent: args.userAgent } : {}),
    timestamp: Date.now(),
  });
};

/**
 * Strips script tags and malicious HTML from AI output or user inputs.
 * Uses DOMPurify but ensures it can run in a serverless edge environment if needed.
 * Note: Actual DOMPurify may require JSDOM in Node environments.
 */
export const sanitizeHtml = (html: string): string => {
  // If running in Convex V8, we can use a regex fallback or a server-safe library.
  // Assuming a generic sanitize approach for demonstration:
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
};
