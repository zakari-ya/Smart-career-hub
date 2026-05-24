import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { useMutation } from "convex/react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { convex } from "./convex";
import { authClient } from "./auth-client";
import { api } from "../../convex/_generated/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <AuthSync>{children}</AuthSync>
    </ConvexBetterAuthProvider>
  );
}

function AuthSync({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const syncUser = useMutation(api.auth.syncUser);
  const sessionId = session.data?.session?.id;

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    void syncUser({}).catch(() => undefined);
  }, [sessionId, syncUser]);

  return <>{children}</>;
}
