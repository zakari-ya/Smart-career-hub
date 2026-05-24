import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

export async function getAuthenticatedIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
}

export function getAuthUserId(identity: {
  tokenIdentifier?: string | null;
  subject: string;
}) {
  return identity.tokenIdentifier ?? identity.subject;
}
