import { Analysis } from "../../types";
import { ScoreRing } from "./ScoreRing";
import { StrengthsList } from "./StrengthsList";
import { WeaknessesList } from "./WeaknessesList";
import { SuggestionCard } from "./SuggestionCard";
import { Sparkles, AlertCircle, FileText } from "lucide-react";

interface AnalysisResultsProps {
  analysis: Analysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (analysis.status === "pending" || analysis.status === "processing") {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border border-border border-t-accent" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
        </div>
        <p className="text-lg font-medium text-primary animate-pulse">AI is crafting your analysis...</p>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <div className="rounded-card border border-error/20 bg-error/5 p-8 flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-error" />
        </div>
        <div>
          <h2 className="text-xl font-medium text-error">Analysis Failed</h2>
          <p className="mt-2 text-sm text-error/80 max-w-sm">
            {analysis.errorMessage || "There was an error processing your request. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis.result) return null;

  return (
    <div className="space-y-16 animate-fade-in">
      {/* ── Executive Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        <div className="lg:col-span-4 flex justify-center lg:justify-start">
          <ScoreRing score={analysis.result.score} />
        </div>
        
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-medium text-primary tracking-tight mb-4">Executive Summary</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-secondary font-normal">
                {analysis.result.summary}
              </p>
            </div>
          </div>
          
          {analysis.result.missingSkills && analysis.result.missingSkills.length > 0 && (
            <div className="pt-8 border-t border-border/50">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4">
                Missing Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.result.missingSkills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center rounded-sm bg-surface px-3 py-1.5 text-xs font-medium text-primary border border-border/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Strengths & Weaknesses ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-1">
        <div className="flex flex-col gap-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-success">
            Strengths
          </h3>
          <StrengthsList strengths={analysis.result.strengths} />
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-error">
            Areas for Improvement
          </h3>
          <WeaknessesList weaknesses={analysis.result.weaknesses} />
        </div>
      </div>

      {/* ── Actionable Suggestions ──────────────────────────────────── */}
      <div className="pt-16 border-t border-border">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-8 text-center">
          Next Steps & Action Plan
        </h3>
        <SuggestionCard suggestions={analysis.result.suggestions} />
      </div>

      {/* ── Improved Project Descriptions ─────────────────────────────── */}
      {analysis.result.improvedDescriptions && analysis.result.improvedDescriptions.length > 0 && (
        <div className="rounded-card bg-accent p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FileText size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-medium tracking-tight mb-8">AI-Optimized Project Bullet Points</h3>
            <div className="grid grid-cols-1 gap-6">
              {analysis.result.improvedDescriptions.map((desc, i) => (
                <div key={i} className="rounded-md bg-white/10 p-6 backdrop-blur-sm border border-white/5 font-mono text-sm leading-relaxed">
                  <span className="text-white/40 mr-3">// Suggestion {i + 1}</span>
                  <p className="mt-2 text-white/90">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
