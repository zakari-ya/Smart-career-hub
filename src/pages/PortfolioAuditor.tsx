import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PortfolioInput } from "../components/portfolio/PortfolioInput";
import { PortfolioResults } from "../components/portfolio/PortfolioResults";
import { Analysis } from "../types";
import { toast } from "sonner";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { Github, Loader2, Activity, GitBranch, Users, Star } from "lucide-react";
import { StepWizard } from "../components/ui/StepWizard";

const WIZARD_STEPS = [
  { id: "enter", label: "Enter URL" },
  { id: "audit", label: "Auditing" },
  { id: "results", label: "Results" },
];

type Phase = "idle" | "auditing" | "done";

function phaseToStep(phase: Phase): number {
  if (phase === "idle") return 0;
  if (phase === "auditing") return 1;
  return 2;
}

const fetchGitHubData = async (urlOrUsername: string) => {
  const username = urlOrUsername
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//, "")
    .split("/")[0];
  if (!username) throw new Error("Invalid GitHub URL or username");

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`),
  ]);

  if (!userRes.ok) {
    if (userRes.status === 403 || userRes.status === 429)
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    throw new Error(`GitHub user "${username}" not found`);
  }

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  let summary = `GitHub Profile: ${user.login}\n`;
  summary += `Name: ${user.name || "N/A"}\n`;
  summary += `Bio: ${user.bio || "N/A"}\n`;
  summary += `Public Repos: ${user.public_repos}\n`;
  summary += `Followers: ${user.followers}\n\nRecent Repositories:\n`;
  for (const repo of repos) {
    summary += `- ${repo.name}: ${repo.description || "No description"} (Stars: ${repo.stargazers_count}, Language: ${repo.language})\n`;
  }
  return { summary, user, repos };
};

export function PortfolioAuditor() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [githubUser, setGithubUser] = useState<{ login: string; public_repos: number; followers: number } | null>(null);

  const createAnalysisRecord = useMutation(api.analyses.createAnalysisRecord);
  const runAnalysis = useAction(api.analysisActions.runAnalysis);

  const handleAudit = async (urlOrUsername: string) => {
    const portfolioUrl = urlOrUsername.startsWith("http")
      ? urlOrUsername
      : `https://github.com/${urlOrUsername}`;

    setPhase("auditing");
    setAnalysis(null);

    try {
      const { summary, user } = await fetchGitHubData(urlOrUsername);
      setGithubUser(user as { login: string; public_repos: number; followers: number });

      const analysisId = await createAnalysisRecord({ type: "portfolio_audit", portfolioUrl });

      const result = await runAnalysis({
        analysisId,
        type: "portfolio_audit",
        portfolioUrl,
        resumeText: summary,
      });

      if (!result) throw new Error("Empty result from AI");

      const auditResult = result as {
        score: number;
        summary: string;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
      };

      setAnalysis({
        _id: analysisId as unknown as string,
        userId: "temp" as unknown as Id<"users">,
        clerkId: "",
        type: "portfolio_audit",
        aiModel: "google/gemini-2.5-flash-preview",
        status: "completed",
        portfolioUrl,
        result: auditResult,
        createdAt: Date.now(),
        completedAt: Date.now(),
      } as unknown as Analysis);

      setPhase("done");
      toast.success("Portfolio audit complete!");
    } catch (error) {
      console.error("[PortfolioAuditor]", error);
      toast.error(error instanceof Error ? error.message : "Portfolio audit failed.");
      setPhase("idle");
    }
  };

  // ── Step 0: Enter URL ─────────────────────────────────────────────────
  const stepEnter = (
    <div className="flex flex-col gap-10">
      {/* Hero input area */}
      <div className="flex flex-col items-center text-center gap-6 pt-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface">
          <Github className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary tracking-tight">
            Audit your GitHub identity
          </h2>
          <p className="mt-1.5 text-sm text-secondary">
            Enter your username or profile URL — we'll analyse your repos and profile.
          </p>
        </div>
        <div className="w-full max-w-lg">
          <PortfolioInput onSubmit={handleAudit} isLoading={false} />
        </div>
      </div>

      {/* Feature preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-8">
        {[
          {
            icon: Users,
            label: "Profile Audit",
            desc: "Bio, photo, pinned repos and public links scored for recruiter-readiness.",
          },
          {
            icon: GitBranch,
            label: "Repo Analysis",
            desc: "Top 5 repositories evaluated for README quality and tech stack clarity.",
          },
          {
            icon: Star,
            label: "Action Plan",
            desc: "Specific, prioritised tips to improve your engineering presence.",
          },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-background p-5 flex flex-col gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface">
              <Icon className="h-4 w-4 text-secondary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{label}</p>
              <p className="mt-1 text-xs text-secondary leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Step 1: Auditing ──────────────────────────────────────────────────
  const stepAuditing = (
    <div className="flex flex-col items-center justify-center gap-8 py-20 text-center">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border border-border bg-surface flex items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-primary" strokeWidth={1} />
        </div>
        <Activity
          className="absolute -top-2 -right-2 h-7 w-7 text-primary animate-pulse"
          strokeWidth={1}
        />
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-primary tracking-tight">
          Analysing Repositories…
        </h2>
        <p className="mt-2 text-secondary text-sm max-w-sm mx-auto">
          Fetching your profile data and performing a deep audit of your open-source presence.
        </p>
        {githubUser && (
          <p className="mt-3 text-xs font-mono text-muted">
            @{githubUser.login} · {githubUser.public_repos} repos · {githubUser.followers} followers
          </p>
        )}
      </div>
      {/* Animated progress shimmer */}
      <div className="w-48 h-0.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{
            width: "40%",
            animation: "slideProgress 1.8s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );

  // ── Step 2: Results ───────────────────────────────────────────────────
  const stepResults = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">Audit Results</h2>
        <button
          onClick={() => { setAnalysis(null); setPhase("idle"); }}
          className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          <Github className="h-3.5 w-3.5" />
          New Audit
        </button>
      </div>
      {analysis && (
        <ErrorBoundary>
          <PortfolioResults analysis={analysis} />
        </ErrorBoundary>
      )}
    </div>
  );

  return (
    <StepWizard
      title="Portfolio Auditor"
      subtitle="AI-powered GitHub profile and repository analysis."
      steps={WIZARD_STEPS}
      currentStep={phaseToStep(phase)}
    >
      {[stepEnter, stepAuditing, stepResults]}
    </StepWizard>
  );
}
