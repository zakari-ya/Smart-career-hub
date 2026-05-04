import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { convex } from "./convex";
import { ReactNode } from "react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error(
    "CRITICAL: Missing VITE_CLERK_PUBLISHABLE_KEY environment variable. " +
      "Check your .env.local file or production environment variables.",
  );
}

// Runtime check: Prevent accidental use of dev keys in production builds
if (import.meta.env.PROD && clerkPubKey.startsWith("pk_test_")) {
  console.warn(
    "SECURITY WARNING: You are using a Clerk DEVELOPMENT key in a PRODUCTION build. " +
      "Usage limits will be restricted and security features may be limited.",
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
