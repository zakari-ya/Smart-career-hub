import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Github, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "../lib/auth-client";
import { useAppAuth } from "../hooks/useAppAuth";

export function SignUp() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAppAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to create your account.");
      }

      toast.success("Account created successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: "google" | "github") => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Unable to sign up with ${provider}.`,
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center py-12">
      <div className="w-full rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
            Create Account
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
            Start your workspace
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Use email and password, or create your account with Google or GitHub.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailSignUp}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-muted">
              Full Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-primary outline-none transition-colors focus:border-accent"
              placeholder="Jane Developer"
              required
            />
          </label>

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
              placeholder="At least 8 characters"
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
            Create Account
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
            onClick={() => void handleSocialSignUp("google")}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-medium text-primary transition-colors hover:bg-surface"
          >
            <Mail className="h-4 w-4" />
            Google
          </button>
          <button
            type="button"
            onClick={() => void handleSocialSignUp("github")}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background text-sm font-medium text-primary transition-colors hover:bg-surface"
          >
            <Github className="h-4 w-4" />
            GitHub
          </button>
        </div>

        <p className="mt-6 text-sm text-secondary">
          Already have an account?{" "}
          <Link className="font-medium text-accent hover:underline" to="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
