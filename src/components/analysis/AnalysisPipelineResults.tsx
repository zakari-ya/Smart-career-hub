import { Doc } from "../../../convex/_generated/dataModel";
import { CheckCircle2, Circle, AlertCircle, Loader2, Star, Zap, Search, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { StaggerContainer } from "../animations/StaggerContainer";
import { AnimatedCard } from "../animations/AnimatedCard";
import { ScoreCircle } from "../animations/ScoreCircle";

interface Props {
  pipeline: Doc<"analysisPipeline">;
}

interface Phase1Data {
  wordCount: number;
  structureOk: boolean;
  extractionQuality: string;
}

interface Phase2Data {
  score: number;
  tier: string;
  topSkills: string[];
  preliminaryFeedback: string;
}

interface Phase3Data {
  detailedAssessment: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  bulletRewrites: Array<{
    original: string;
    rewritten: string;
    reason: string;
  }>;
}

export function AnalysisPipelineResults({ pipeline }: Props) {
  const { phase1, phase2, phase3 } = pipeline;
  
  const p1Data = phase1.data as Phase1Data | undefined;
  const p2Data = phase2.data as Phase2Data | undefined;
  const p3Data = phase3.data as Phase3Data | undefined;

  return (
    <StaggerContainer className="flex flex-col gap-8 w-full max-w-full">
      {/* ── Status Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 gap-4">
        <h2 className="text-2xl font-medium tracking-tight text-primary">Intelligence Report</h2>
        <div className="flex items-center gap-4 text-xs font-mono">
          <PhaseBadge phase="Structure" status={phase1.status} />
          <PhaseBadge phase="Fast Scan" status={phase2.status} />
          <PhaseBadge phase="Deep Audit" status={phase3.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Top Level Stats & Assessment */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          <AnimatedCard className="bg-surface/50 border-border/50 p-6 flex flex-col items-center justify-center min-h-[300px]">
            {phase2.status === "completed" && p2Data ? (
              <div className="flex flex-col items-center">
                <ScoreCircle score={p2Data.score} size={180} />
                <span className={cn(
                  "mt-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full",
                  p2Data.tier === "WEAK" && "bg-destructive/10 text-destructive",
                  p2Data.tier === "AVERAGE" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
                  p2Data.tier === "STRONG" && "bg-success/10 text-success",
                  p2Data.tier === "EXCEPTIONAL" && "bg-accent/10 text-accent"
                )}>
                  {p2Data.tier}
                </span>
              </div>
            ) : phase2.status === "processing" ? (
              <LoadingState text="Calculating score..." />
            ) : phase2.status === "failed" ? (
              <ErrorMessage error={phase2.error || "Scan failed."} />
            ) : (
              <div className="text-muted text-sm flex flex-col items-center gap-2">
                <Circle className="w-8 h-8 opacity-20" />
                <p>Awaiting Phase 2...</p>
              </div>
            )}
          </AnimatedCard>

          {/* Phase 1 Data Integrity Summary */}
          <AnimatedCard className="p-6 border-border/50 bg-background">
            <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Document Integrity
            </h3>
            {phase1.status === "completed" && p1Data ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-secondary text-sm">Word Count</span>
                  <span className="font-medium text-primary font-mono">{p1Data.wordCount}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-secondary text-sm">Structure</span>
                  <span className={cn("text-sm font-medium", p1Data.structureOk ? "text-success" : "text-amber-500")}>
                    {p1Data.structureOk ? "Passed" : "Flagged"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Quality</span>
                  <span className="font-medium text-primary capitalize text-sm">{p1Data.extractionQuality}</span>
                </div>
              </div>
            ) : phase1.status === "processing" ? (
              <LoadingState text="Validating structure..." />
            ) : phase1.status === "failed" ? (
              <ErrorMessage error={phase1.error || "Structure validation failed."} />
            ) : (
              <p className="text-muted text-sm">Pending...</p>
            )}
          </AnimatedCard>
        </div>

        {/* Right Column: Deep Analysis */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Preliminary Feedback & Skills */}
          {phase2.status === "completed" && p2Data && (
            <AnimatedCard className="p-6 md:p-8 bg-surface/30 border-border/50">
              <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-primary mb-3">Preliminary Assessment</h3>
                  <p className="text-secondary text-sm leading-relaxed mb-6">
                    {p2Data.preliminaryFeedback}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p2Data.topSkills.map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 bg-background border border-border/50 text-xs font-medium rounded-md text-secondary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Deep Audit Content */}
          <div className={cn("transition-all duration-500", phase3.status === "pending" && "opacity-40 grayscale")}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-md bg-surface border border-border/50">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-primary">Deep Semantic Audit</h2>
            </div>

            {phase3.status === "completed" && p3Data ? (
              <div className="flex flex-col gap-8">
                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedCard className="p-6 border-success/20 bg-success/5">
                    <h3 className="text-xs font-bold text-success uppercase tracking-wider flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-4 h-4" /> Core Strengths
                    </h3>
                    <ul className="space-y-3">
                      {p3Data.strengths.map((s: string) => (
                        <li key={s} className="flex gap-3 text-secondary text-sm leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-2" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedCard>
                  <AnimatedCard className="p-6 border-destructive/20 bg-destructive/5">
                    <h3 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4" /> Growth Areas
                    </h3>
                    <ul className="space-y-3">
                      {p3Data.weaknesses.map((w: string) => (
                        <li key={w} className="flex gap-3 text-secondary text-sm leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-2" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </AnimatedCard>
                </div>

                {/* Detailed Assessment */}
                <AnimatedCard className="p-6 bg-background border-border/50">
                  <h3 className="text-sm font-medium text-primary mb-3">Overall Assessment</h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    {p3Data.detailedAssessment}
                  </p>
                </AnimatedCard>

                {/* Rewrites */}
                {p3Data.bulletRewrites && p3Data.bulletRewrites.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-primary">Actionable Rewrites</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {p3Data.bulletRewrites.map((item, i) => (
                        <AnimatedCard key={i} className="p-5 bg-background border-border/50 group hover:border-accent/50 transition-colors">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Original</span>
                              <p className="text-sm text-muted line-through decoration-border leading-relaxed">{item.original}</p>
                            </div>
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> STAR Method Rewrite
                              </span>
                              <p className="text-sm text-primary font-medium leading-relaxed">{item.rewritten}</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-border/30 flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                            <p className="text-xs text-secondary leading-relaxed">
                              <span className="font-medium text-primary mr-1">Why this works:</span> 
                              {item.reason}
                            </p>
                          </div>
                        </AnimatedCard>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : phase3.status === "processing" ? (
              <LoadingState text="Performing deep semantic analysis..." />
            ) : phase3.status === "failed" ? (
              <ErrorMessage error={phase3.error || "Deep audit failed."} />
            ) : (
              <div className="h-48 border border-border/50 border-dashed rounded-xl flex items-center justify-center text-muted">
                Waiting for previous phases to complete...
              </div>
            )}
          </div>
        </div>
      </div>
    </StaggerContainer>
  );
}

function PhaseBadge({ phase, status }: { phase: string; status: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {status === "completed" ? (
        <CheckCircle2 className="w-4 h-4 text-success" />
      ) : status === "failed" ? (
        <AlertCircle className="w-4 h-4 text-destructive" />
      ) : status === "processing" ? (
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
      ) : (
        <Circle className="w-4 h-4 text-border" />
      )}
      <span className={cn(
        "hidden sm:inline-block", 
        status === "completed" ? "text-primary font-medium" : "text-muted"
      )}>{phase}</span>
    </div>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <div className="w-full h-48 flex flex-col items-center justify-center border border-border/50 bg-surface/50 rounded-xl gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border border-border/50 bg-background flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      </div>
      <p className="text-sm font-mono text-muted">{text}</p>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="w-full p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <p className="text-sm text-destructive font-medium">{error}</p>
    </div>
  );
}
