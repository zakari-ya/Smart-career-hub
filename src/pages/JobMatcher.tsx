import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobMatcherForm } from "../components/jobs/JobMatcherForm";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { toast } from "sonner";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

type Phase = "idle" | "extracting" | "extracted" | "analyzing" | "done";

export function JobMatcher() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");

  const resumes = useQuery(api.resumes.getMyResumes);
  const extractTextAction = useAction(api.extraction.extractText);
  const analyzeResumeAction = useAction(api.analysis.analyzeResume);

  const handleInitialSubmit = async (resumeId: string, jd: string) => {
    const resume = resumes?.find((r) => r._id === resumeId);
    if (!resume) return;

    setJobDescription(jd);
    setPhase("extracting");
    setError("");
    setAnalysis(null);

    try {
      if (resume.extractedText) {
        setExtractedText(resume.extractedText);
        setPhase("extracted");
        return;
      }
      const result = await extractTextAction({
        fileBase64: "",
        fileName: resume.title,
        fileType: resume.fileType,
        ...(resume.fileStorageId ? { storageId: resume.fileStorageId } : {}),
      });
      if (result.success && result.extractedText) {
        setExtractedText(result.extractedText);
        setPhase("extracted");
      } else {
        setError(result.error ?? "Extraction failed");
        setPhase("idle");
        toast.error(result.error ?? "Extraction failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Extraction error");
      setPhase("idle");
    }
  };

  const handleRunMatch = async () => {
    if (!extractedText || !jobDescription) return;
    setPhase("analyzing");
    setError("");

    try {
      const result = await analyzeResumeAction({
        extractedText,
        jobDescription,
        analysisType: "match",
      });

      if (result.success && result.analysis) {
        interface AIMatchResult {
          matchScore?: number;
          honestAssessment?: string;
          matchReason?: string;
          skillsAnalysis?: {
            matchedSkills?: string[];
            missingSkills?: string[];
            transferableSkills?: string[];
          };
          experienceGap?: string;
          resumeTailoring?: string[];
          realisticNextSteps?: string[];
        }
        const aiResult = result.analysis as AIMatchResult;
        const mappedAnalysis = {
          _id: "temp",
          userId: "temp",
          clerkId: "temp",
          createdAt: Date.now(),
          status: "completed",
          type: "job_match",
          aiModel: "gpt-4o",
          result: {
            score: aiResult.matchScore ?? 0,
            summary: aiResult.honestAssessment ?? aiResult.matchReason ?? "Analysis completed.",
            strengths: aiResult.skillsAnalysis?.matchedSkills ?? [],
            weaknesses: [
              ...(aiResult.skillsAnalysis?.missingSkills ?? []),
              aiResult.experienceGap,
            ].filter(Boolean) as string[],
            suggestions: [
              ...(aiResult.resumeTailoring ?? []),
              ...(aiResult.realisticNextSteps ?? []),
            ],
            missingSkills: aiResult.skillsAnalysis?.missingSkills ?? [],
          },
        } as unknown as Analysis;
        setAnalysis(mappedAnalysis);
        setPhase("done");
        toast.success("Job match analysis complete!");
      } else {
        setError(result.error ?? "Match analysis failed");
        setPhase("extracted");
        toast.error(result.error ?? "Match analysis failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service error");
      setPhase("extracted");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setExtractedText("");
    setJobDescription("");
    setAnalysis(null);
    setError("");
  };

  const isLoading = phase === "extracting" || phase === "analyzing";

  return (
    <div className="mx-auto max-w-[1200px] w-full py-12 px-6 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-16 border-b border-border pb-10">
        <h1 className="text-5xl font-semibold text-primary tracking-tight leading-tight mb-4">
          Job Matcher
        </h1>
        <p className="text-lg text-secondary font-normal max-w-2xl">
          Quantify your alignment with any role. Our AI analyses the hidden requirements 
          in job descriptions and surfaces exact skill gaps.
        </p>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Left — Form */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-medium text-primary tracking-tight mb-2">Match Parameters</h2>
                <p className="text-sm text-secondary font-normal">Select your profile and paste the job details.</p>
              </div>
              <div className="p-8 rounded-card bg-surface border border-border/30">
                <JobMatcherForm
                  onSubmit={handleInitialSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right — States panel */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {/* IDLE */}
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-8 py-32 text-center border-2 border-dashed border-border/50 rounded-card bg-surface/10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-border/50">
                  <Briefcase className="h-8 w-8 text-muted" strokeWidth={1} />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-primary">Find your perfect match</h3>
                  <p className="mt-2 text-sm text-secondary font-normal max-w-xs mx-auto">
                    Configure your parameters on the left to see exactly how your experience 
                    aligns with the role.
                  </p>
                </div>
              </motion.div>
            )}

            {/* EXTRACTING / ANALYZING LOADING */}
            {(phase === "extracting" || phase === "analyzing") && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-8 py-32 text-center"
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border border-border flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-accent" strokeWidth={1} />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-pulse" strokeWidth={1} />
                </div>
                <div>
                  <h2 className="text-3xl font-medium text-primary tracking-tight">
                    {phase === "extracting" ? "Preparing Resume..." : "Quantifying Match..."}
                  </h2>
                  <p className="mt-2 text-secondary font-normal max-w-sm mx-auto">
                    {phase === "extracting" 
                      ? "We're parsing your document to prepare for the comparison."
                      : "We're cross-referencing your experience with every bullet point in the job description."}
                  </p>
                </div>
              </motion.div>
            )}

            {/* EXTRACTED — READY TO MATCH */}
            {phase === "extracted" && (
              <motion.div
                key="extracted"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-8"
              >
                <div className="p-8 rounded-card border-2 border-accent/20 bg-accent/5 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <h3 className="text-xl font-medium text-primary">Resume Parsed</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Ready</span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">
                    Your resume data is successfully cached. Click below to run the AI comparison 
                    against the provided job description.
                  </p>
                  <button
                    onClick={() => void handleRunMatch()}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Match Report
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full h-12 flex items-center justify-center gap-2 rounded-full border border-border bg-transparent text-sm font-medium text-muted hover:text-primary transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Parameters
                  </button>
                </div>

                <div className="rounded-card bg-surface p-8 border border-border/30">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4">Resume Preview</h4>
                  <pre className="max-h-48 overflow-y-auto text-xs leading-relaxed text-secondary whitespace-pre-wrap font-mono scrollbar-hide">
                    {extractedText}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* DONE — RESULTS */}
            {phase === "done" && analysis && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-8"
              >
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <h2 className="text-3xl font-medium text-primary tracking-tight">Match Results</h2>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    New Match
                  </button>
                </div>
                <ErrorBoundary>
                  <AnalysisResults analysis={analysis} />
                </ErrorBoundary>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ERROR BANNER */}
          {error && (
            <div className="mt-8 flex items-center gap-4 rounded-md border border-error/20 bg-error/5 p-4 text-sm text-error">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
