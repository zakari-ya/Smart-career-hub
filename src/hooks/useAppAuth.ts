import { useCallback } from "react";
import { authClient } from "../lib/auth-client";

export function useAppAuth() {
  const session = authClient.useSession();
  const user = session.data?.user ?? null;

  const signOut = useCallback(async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.assign("/");
        },
      },
    });
  }, []);

  return {
    session: session.data ?? null,
    user,
    isLoaded: !session.isPending,
    isSignedIn: Boolean(session.data?.session),
    signOut,
    refetchSession: session.refetch,
  };
}
