import { Outlet } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TopNav } from "./TopNav";
import { InstallPrompt } from "./InstallPrompt";

/**
 * AppLayout — wraps all routes with the sticky TopNav and a
 * max-width content container. The old left-sidebar is gone.
 *
 * Security note: syncUser fires only when Clerk has confirmed
 * `isSignedIn`, so `user` is never null when the mutation runs.
 */
export function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const syncUser = useMutation(api.auth.syncUser);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUser({
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "User",
        avatarUrl: user.imageUrl ?? undefined,
      }).catch((err: unknown) => {
        console.error("[syncUser] Failed to sync user to Convex:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]);

  return (
    <div className="relative min-h-screen bg-background text-primary selection:bg-accent/10 selection:text-primary">
      {/* ── Sticky top navigation ─────────────────────────────────────── */}
      <TopNav />

      {/* ── Page content ──────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* ── PWA install prompt ────────────────────────────────────────── */}
      <InstallPrompt />
    </div>
  );
}
