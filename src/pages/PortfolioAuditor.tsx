import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PortfolioInput } from "../components/portfolio/PortfolioInput";
import { PortfolioResults } from "../components/portfolio/PortfolioResults";
import { Analysis } from "../types";
import { toast } from "sonner";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { Github, Loader2, Activity, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fetchGitHubData = async (urlOrUsername: string) => {
  const username = urlOrUsername
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//, "")
    .split("/")[0];
  if (!username) throw new Error("Invalid GitHub URL or username");

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`,
    ),
  ]);

  if (!userRes.ok) {
    if (userRes.status === 403 || userRes.status === 429) {
      throw new Error(
        "GitHub API rate limit exceeded. Please try again later.",
      );
    }
    throw new Error(`GitHub user "${username}" not found`);
  }

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  let summary = `GitHub Profile: ${user.login}\n`;
  summary += `Name: ${user.name || "N/A"}\n`;
  summary += `Bio: ${user.bio || "N/A"}\n`;
  summary += `Public Repos: ${user.public_repos}\n`;
  summary += `Followers: ${user.followers}\n\n`;
  summary += `Recent Repositories:\n`;
  for (const repo of repos) {
    summary += `- ${repo.name}: ${repo.description || "No description"} (Stars: ${repo.stargazers_count}, Language: ${repo.language})\n`;
  }
  return summary;
};

export function PortfolioAuditor() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const createAnalysisRecord = useMutation(api.analyses.createAnalysisRecord);
  const runAnalysis = useAction(api.analysisActions.runAnalysis);

  const handleAudit = async (urlOrUsername: string) => {
    const portfolioUrl = urlOrUsername.startsWith("http")
      ? urlOrUsername
      : `https://github.com/${urlOrUsername}`;

    setIsAuditing(true);
    setAnalysis(null);

    try {
      const githubSummary = await fetchGitHubData(urlOrUsername);

      const analysisId = await createAnalysisRecord({
        type: "portfolio_audit",
        portfolioUrl,
      });

      const result = await runAnalysis({
        analysisId,
        type: "portfolio_audit",
        portfolioUrl,
        resumeText: githubSummary,
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

      toast.success("Portfolio audit complete!");
    } catch (error) {
      console.error("[PortfolioAuditor]", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Portfolio audit failed.",
      );
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] w-full py-12 px-6 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-16 border-b border-border pb-10">
        <h1 className="text-5xl font-semibold text-primary tracking-tight leading-tight mb-4">
          Portfolio Auditor
        </h1>
        <p className="text-lg text-secondary font-normal max-w-2xl">
          Analyse your public GitHub profile and repositories for best
          practices. AI suggests professional README improvements and profile optimization.
        </p>
      </div>

      {/* ── Input Section ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl mb-24">
        <div className="relative flex flex-col items-center gap-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface border border-border/50">
            <Github className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-primary tracking-tight">Audit your GitHub identity</h2>
            <p className="mt-2 text-secondary font-normal">Enter your username or profile URL below</p>
          </div>
          <div className="w-full">
            <PortfolioInput onSubmit={handleAudit} isLoading={isAuditing} />
          </div>
        </div>
      </div>

      {/* ── Results Area ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {isAuditing && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-8 py-20 text-center"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full border border-border flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" strokeWidth={1} />
              </div>
              <Activity className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-3xl font-medium text-primary tracking-tight">Analysing Repositories...</h2>
              <p className="mt-2 text-secondary font-normal max-w-sm mx-auto">
                We're fetching your profile data and performing a deep audit of your open-source presence.
              </p>
            </div>
            {/* Animated progress bar */}
            <div className="w-full max-w-xs">
              <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {!isAuditing && analysis && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-12"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-medium text-primary tracking-tight">Audit Results</h2>
              <button
                onClick={() => setAnalysis(null)}
                className="flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors"
              >
                <Search className="h-4 w-4" />
                New Audit
              </button>
            </div>
            <ErrorBoundary>
              <PortfolioResults analysis={analysis} />
            </ErrorBoundary>
          </motion.div>
        )}

        {!isAuditing && !analysis && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border/50"
          >
            {[
              { label: "Profile Audit", desc: "Check your bio, photo, and public links for recruiter-readiness." },
              { label: "Repo Analysis", desc: "Evaluate your top 5 repositories for README quality and tech stack clarity." },
              { label: "Action Plan", desc: "Get specific, actionable tips to improve your professional engineering presence." },
            ].map((item) => (
              <div key={item.label} className="p-8 rounded-card bg-surface/30 border border-border/20">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4">{item.label}</p>
                <p className="text-sm text-secondary leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
