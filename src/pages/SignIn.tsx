import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Github, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "../lib/auth-client";
import { useAppAuth } from "../hooks/useAppAuth";

function isPreviewSocialDisabled() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.location.hostname.endsWith(".vercel.app");
}

export function SignIn() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAppAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewSocialDisabled = isPreviewSocialDisabled();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to sign in.");
      }

      toast.success("Signed in successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Unable to sign in with ${provider}.`,
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center py-12">
      <div className="w-full rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            Welcome Back
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
            Sign in to Smart Career Hub
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Continue with email and password, or use a linked provider.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-accent"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-accent"
              placeholder="Enter your password"
              minLength={8}
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            Sign In
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={previewSocialDisabled}
            onClick={() => void handleSocialSignIn("google")}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-medium text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mail className="h-4 w-4" />
            Google
          </button>
          <button
            type="button"
            disabled={previewSocialDisabled}
            onClick={() => void handleSocialSignIn("github")}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-medium text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        {previewSocialDisabled && (
          <p className="mt-4 text-xs text-secondary">
            Social sign-in is disabled on preview hosts. Use email and password on Vercel previews.
          </p>
        )}

        <p className="mt-6 text-sm text-secondary">
          New here?{" "}
          <Link className="font-medium text-accent hover:underline" to="/sign-up">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
