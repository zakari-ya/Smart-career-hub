import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResumeUploader } from "../components/resume/ResumeUploader";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { toast } from "sonner";
import {
  FileSearch,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { cn } from "../lib/utils";

type Phase = "idle" | "extracting" | "extracted" | "analyzing" | "done";

export function ResumeScanner() {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");

  const resumes = useQuery(api.resumes.getMyResumes);
  const extractTextAction = useAction(api.extraction.extractText);
  const analyzeResumeAction = useAction(api.analysis.analyzeResume);

  const steps = ["Upload", "Extract", "Analyze", "Results"];
  const currentStepIndex = phase === "idle" ? 0 : phase === "extracting" || phase === "extracted" ? 1 : phase === "analyzing" ? 2 : 3;

  const handleExtract = async () => {
    if (!selectedResumeId) {
      toast.error("Select a resume first.");
      return;
    }
    const resume = resumes?.find((r) => r._id === selectedResumeId);
    if (!resume) return;

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
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setPhase("idle");
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText) return;
    setPhase("analyzing");
    setError("");

    try {
      const result = await analyzeResumeAction({ extractedText, analysisType: "resume" });

      if (result.success && result.analysis) {
        interface AIResult {
          overallATSScore?: number;
          honestAssessment?: string;
          verdictReason?: string;
          sections?: Record<string, { score: number; feedback: string }>;
          top3Actions?: string[];
          missingKeywords?: string[];
        }
        const aiResult = result.analysis as AIResult;
        const mappedAnalysis = {
          _id: "temp",
          userId: "temp",
          clerkId: "temp",
          createdAt: Date.now(),
          status: "completed",
          type: "resume_review",
          aiModel: "gpt-4",
          result: {
            score: aiResult.overallATSScore ?? 0,
            summary: aiResult.honestAssessment ?? aiResult.verdictReason ?? "Analysis completed.",
            strengths: Object.entries(aiResult.sections ?? {})
              .filter(([, d]) => d.score >= 70)
              .map(([s, d]) => `${s}: ${d.feedback}`),
            weaknesses: Object.entries(aiResult.sections ?? {})
              .filter(([, d]) => d.score < 70)
              .map(([s, d]) => `${s}: ${d.feedback}`),
            suggestions: aiResult.top3Actions ?? [],
            missingSkills: aiResult.missingKeywords ?? [],
          },
        } as unknown as Analysis;
        setAnalysis(mappedAnalysis);
        setPhase("done");
        toast.success("AI Analysis complete!");
      } else {
        setError(result.error ?? "Analysis failed");
        setPhase("extracted");
        toast.error(result.error ?? "Analysis failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service error");
      setPhase("extracted");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setSelectedResumeId(null);
    setExtractedText("");
    setAnalysis(null);
    setError("");
  };

  return (
    <div className="mx-auto max-w-[1200px] w-full py-12 px-6 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-16 border-b border-border pb-10">
        <h1 className="text-5xl font-semibold text-primary tracking-tight leading-tight mb-4">
          Resume Scanner
        </h1>
        <p className="text-lg text-secondary font-normal max-w-2xl">
          Upload your resume for a professional-grade ATS audit. 
          Uncover hidden gaps and get actionable feedback in under 30 seconds.
        </p>
      </div>

      {/* ── Progress Bar (Minimalist) ─────────────────────────────────── */}
      <div className="mb-12 flex items-center gap-4">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-4 flex-1 last:flex-initial">
            <div className="flex flex-col gap-1">
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                i <= currentStepIndex ? "text-accent" : "text-muted"
              )}>
                {step}
              </span>
              <div className={cn(
                "h-1 rounded-full transition-all duration-500",
                i <= currentStepIndex ? "bg-accent" : "bg-border"
              )} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        
        {/* IDLE / UPLOAD */}
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-12 lg:grid-cols-12"
          >
            <div className="lg:col-span-4">
              <ResumeUploader />
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-medium text-primary tracking-tight">Select Resume</h2>
                <p className="text-sm text-muted font-mono">{resumes?.length ?? 0} saved</p>
              </div>

              {!resumes ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 w-full rounded-md bg-surface animate-pulse" />
                  ))}
                </div>
              ) : resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-card border border-dashed border-border bg-surface/30">
                  <FileSearch className="h-8 w-8 text-muted" strokeWidth={1} />
                  <p className="text-sm text-secondary">No resumes uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {resumes.map((resume) => (
                    <button
                      key={resume._id}
                      onClick={() => setSelectedResumeId(resume._id)}
                      className={cn(
                        "group flex items-center justify-between rounded-md border p-4 text-left transition-all",
                        selectedResumeId === resume._id
                          ? "border-accent bg-surface"
                          : "border-border bg-transparent hover:bg-surface/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-sm transition-colors",
                          selectedResumeId === resume._id ? "bg-accent text-white" : "bg-surface text-muted"
                        )}>
                          <FileText className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-medium text-primary">{resume.title}</p>
                          <p className="text-xs text-secondary mt-0.5">{resume.fileType.toUpperCase()} · Updated {new Date(resume._creationTime).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        selectedResumeId === resume._id ? "text-accent translate-x-1" : "text-border"
                      )} />
                    </button>
                  ))}

                  <button
                    onClick={() => void handleExtract()}
                    disabled={!selectedResumeId}
                    className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-8 text-sm font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-30 active:scale-[0.98]"
                  >
                    Extract Content
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
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
                {phase === "extracting" ? "Parsing document..." : "Recruiter-AI at work..."}
              </h2>
              <p className="mt-2 text-secondary font-normal max-w-sm mx-auto">
                {phase === "extracting" 
                  ? "We're extracting text from your resume using deep document parsing."
                  : "We're analyzing keywords, structure, and impact scores."}
              </p>
            </div>
          </motion.div>
        )}

        {/* EXTRACTED PREVIEW */}
        {phase === "extracted" && (
          <motion.div
            key="extracted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-12 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium text-primary tracking-tight">Extracted Content</h2>
                <div className="px-3 py-1 rounded-full bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider">
                  Verified
                </div>
              </div>
              <div className="rounded-card bg-surface p-8 overflow-hidden border border-border/30">
                <pre className="max-h-[500px] overflow-y-auto text-sm leading-relaxed text-secondary whitespace-pre-wrap font-mono scrollbar-hide">
                  {extractedText}
                </pre>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="p-8 rounded-card border border-border bg-background flex flex-col gap-6">
                <h3 className="text-xl font-medium text-primary">Next: AI Deep Dive</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  The content has been parsed successfully. Our AI will now evaluate your resume 
                  against industry-standard ATS benchmarks and modern recruitment patterns.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Keyword Gap Analysis
                  </div>
                  <div className="flex items-center gap-3 text-sm text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Action Verb Audit
                  </div>
                  <div className="flex items-center gap-3 text-sm text-secondary">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Layout Compatibility
                  </div>
                </div>
                <button
                  onClick={() => void handleAnalyze()}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-white transition-all hover:bg-accent/90 active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  Run AI Analysis
                </button>
                <button
                  onClick={handleReset}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-full border border-border bg-transparent text-sm font-medium text-muted hover:text-primary transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Select Different File
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* DONE / RESULTS */}
        {phase === "done" && analysis && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-12"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-medium text-primary tracking-tight">Analysis Results</h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                New Scan
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
        <div className="mt-12 flex items-center gap-4 rounded-md border border-error/20 bg-error/5 p-4 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
