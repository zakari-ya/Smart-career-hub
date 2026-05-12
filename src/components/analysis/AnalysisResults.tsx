import { Analysis } from "../../types";
import { ScoreCircle } from "../animations/ScoreCircle";
import { StrengthsList } from "./StrengthsList";
import { WeaknessesList } from "./WeaknessesList";
import { SuggestionCard } from "./SuggestionCard";
import { Sparkles, AlertCircle, FileText, Target } from "lucide-react";
import { StaggerContainer } from "../animations/StaggerContainer";
import { AnimatedCard } from "../animations/AnimatedCard";

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
    <StaggerContainer className="flex flex-col gap-8 w-full max-w-full pb-20">
      {/* ── Executive Summary ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Score */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <AnimatedCard className="bg-surface/50 border-border/50 p-8 flex flex-col items-center justify-center min-h-[300px]">
            <ScoreCircle score={analysis.result.score} size={200} />
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-muted">
              <Target className="w-4 h-4" />
              <span>Match Alignment</span>
            </div>
          </AnimatedCard>
          
          {analysis.result.missingSkills && analysis.result.missingSkills.length > 0 && (
            <AnimatedCard className="p-6 border-destructive/20 bg-destructive/5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive mb-4">
                Missing Key Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.result.missingSkills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center rounded-sm bg-background px-3 py-1.5 text-xs font-medium text-primary border border-destructive/20">
                    {skill}
                  </span>
                ))}
              </div>
            </AnimatedCard>
          )}
        </div>
        
        {/* Right Column: Details */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          <AnimatedCard className="p-6 md:p-8 bg-background border-border/50">
            <h2 className="text-2xl font-medium text-primary tracking-tight mb-4">Executive Summary</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-sm leading-relaxed text-secondary font-normal">
                {analysis.result.summary}
              </p>
            </div>
          </AnimatedCard>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <AnimatedCard className="p-6 border-success/20 bg-success/5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-success mb-4">
                Strengths
              </h3>
              <StrengthsList strengths={analysis.result.strengths} />
            </AnimatedCard>
            
            <AnimatedCard className="p-6 border-amber-500/20 bg-amber-500/5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 mb-4">
                Areas for Improvement
              </h3>
              <WeaknessesList weaknesses={analysis.result.weaknesses} />
            </AnimatedCard>
          </div>

          {/* Next Steps */}
          <AnimatedCard className="p-6 md:p-8 bg-surface/30 border-border/50">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
              Next Steps & Action Plan
            </h3>
            <SuggestionCard suggestions={analysis.result.suggestions} />
          </AnimatedCard>

          {/* Improved Project Descriptions */}
          {analysis.result.improvedDescriptions && analysis.result.improvedDescriptions.length > 0 && (
            <AnimatedCard className="bg-accent p-8 md:p-10 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <FileText size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-medium tracking-tight mb-6">AI-Optimized Project Bullet Points</h3>
                <div className="grid grid-cols-1 gap-4">
                  {analysis.result.improvedDescriptions.map((desc, i) => (
                    <div key={i} className="rounded-md bg-white/10 p-5 backdrop-blur-sm border border-white/5 font-mono text-sm leading-relaxed">
                      <span className="text-white/40 mr-3">// Suggestion {i + 1}</span>
                      <p className="mt-2 text-white/90">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </StaggerContainer>
  );
}
