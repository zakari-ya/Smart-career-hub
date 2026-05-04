import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PortfolioInput } from "../components/portfolio/PortfolioInput";
import { PortfolioResults } from "../components/portfolio/PortfolioResults";
import { Analysis } from "../types";
import { toast } from "sonner";

export function PortfolioAuditor() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const createAnalysisRecord = useMutation(api.analyses.createAnalysisRecord);
  const runAnalysis = useAction(api.analyses.runAnalysis);

  const handleAudit = async (urlOrUsername: string) => {
    // Accept either "username" or "https://github.com/username"
    const portfolioUrl = urlOrUsername.startsWith("http")
      ? urlOrUsername
      : `https://github.com/${urlOrUsername}`;

    setIsAuditing(true);
    setAnalysis(null);

    try {
      // 1. Create a pending analysis record in Convex
      const analysisId = await createAnalysisRecord({
        type: "portfolio_audit",
        portfolioUrl,
      });

      // 2. Run the AI analysis (Convex action — calls OpenRouter server-side)
      const result = await runAnalysis({
        analysisId,
        type: "portfolio_audit",
        portfolioUrl,
      });

      if (!result) throw new Error("Empty result from AI");

      // 3. Build a local Analysis object to display results immediately
      setAnalysis({
        _id: analysisId,
        userId: "" as Analysis["userId"],
        clerkId: "",
        type: "portfolio_audit",
        aiModel: "google/gemini-2.5-flash-preview",
        status: "completed",
        portfolioUrl,
        result: result as NonNullable<Analysis["result"]>,
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      toast.success("Portfolio audit complete!");
    } catch (error) {
      console.error("[PortfolioAuditor]", error);
      toast.error("Portfolio audit failed. Check that you are signed in and your OpenRouter API key is set in Convex.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Portfolio Auditor</h2>
        <p className="text-muted-foreground">
          Analyze your public GitHub profile and repositories for best practices, 
          and let AI suggest professional README improvements.
        </p>
      </div>

      <PortfolioInput onSubmit={handleAudit} isLoading={isAuditing} />

      {isAuditing && (
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed bg-muted/10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Fetching repositories and analyzing code...</p>
        </div>
      )}

      {!isAuditing && analysis && (
        <PortfolioResults analysis={analysis} />
      )}
      
      {!isAuditing && !analysis && (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/10">
          <p className="text-sm text-muted-foreground">
            Enter your GitHub URL above to generate an audit report.
          </p>
        </div>
      )}
    </div>
  );
}
