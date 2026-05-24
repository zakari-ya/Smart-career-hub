import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ResumeUploader } from "../components/resume/ResumeUploader";
import { AnalysisPipelineResults } from "../components/analysis/AnalysisPipelineResults";
import { useAnalyzePipeline } from "../hooks/useAnalyzePipeline";
import { toast } from "sonner";
import {
  FileSearch,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { StepWizard } from "../components/ui/StepWizard";
import { cn } from "../lib/utils";

type Phase = "idle" | "extracting" | "extracted" | "analyzing";

const WIZARD_STEPS = [
  { id: "upload", label: "Select" },
  { id: "extract", label: "Extract" },
  { id: "analyze", label: "Analyze" },
];

function phaseToStep(phase: Phase): number {
  if (phase === "idle") return 0;
  if (phase === "extracting" || phase === "extracted") return 1;
  return 2; // analyzing
}

export function ResumeScanner() {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");

  const resumes = useQuery(api.resumes.getMyResumes);
  const extractTextAction = useAction(api.extraction.extractText);
  const { pipeline, startPipeline, isInitializing } = useAnalyzePipeline(
    selectedResumeId as Id<"resumes">,
  );

  const handleExtract = async () => {
    if (!selectedResumeId) {
      toast.error("Select a resume first.");
      return;
    }
    const resume = resumes?.find((r) => r._id === selectedResumeId);
    if (!resume) return;

    setPhase("extracting");
    setError("");

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
        resumeId: resume._id,
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
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setPhase("idle");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId) return;
    setPhase("analyzing");
    setError("");

    try {
      await startPipeline();
      toast.info("Asynchronous analysis started.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service error");
      setPhase("extracted");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setSelectedResumeId(null);
    setExtractedText("");
    setError("");
  };

  // ── Step 0: Select Resume ─────────────────────────────────────────────
  const stepSelect = (
    <div className="flex flex-col gap-8">
      {/* Upload new */}
      <section className="rounded-xl border border-border bg-background p-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted mb-5">
          Upload New Resume
        </h2>
        <ResumeUploader />
      </section>

      {/* Or pick saved */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-muted">
            Or Choose Saved
          </h2>
          <span className="text-xs text-muted font-mono">
            {resumes?.length ?? 0} files
          </span>
        </div>

        {!resumes ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-14 w-full rounded-lg bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border border-dashed border-border/60 bg-surface/30">
            <FileSearch className="h-7 w-7 text-muted" strokeWidth={1} />
            <p className="text-sm text-secondary">No resumes uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {resumes.map((resume) => (
              <button
                key={resume._id}
                onClick={() => setSelectedResumeId(resume._id)}
                className={cn(
                  "group flex items-center justify-between rounded-lg border p-4 text-left transition-all",
                  selectedResumeId === resume._id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent hover:bg-surface",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                      selectedResumeId === resume._id
                        ? "bg-primary text-background border-transparent"
                        : "bg-surface text-muted border-border",
                    )}
                  >
                    <FileText className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {resume.title}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      {resume.fileType.toUpperCase()} ·{" "}
                      {new Date(resume._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    selectedResumeId === resume._id
                      ? "text-primary translate-x-0.5"
                      : "text-border",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <div className="flex flex-col gap-3 pt-2">
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        <button
          onClick={() => void handleExtract()}
          disabled={!selectedResumeId}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-background text-sm font-medium transition-all hover:bg-primary/90 disabled:opacity-30 active:scale-[0.98]"
        >
          Extract Content
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // ── Step 1: Extracting / Extracted ────────────────────────────────────
  const stepExtract = (
    <div className="flex flex-col gap-8">
      {phase === "extracting" ? (
        /* Loading card */
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border border-border bg-surface flex items-center justify-center">
              <Loader2
                className="h-9 w-9 animate-spin text-primary"
                strokeWidth={1}
              />
            </div>
            <Sparkles
              className="absolute -top-2 -right-2 h-7 w-7 text-amber-500 animate-pulse"
              strokeWidth={1}
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary tracking-tight">
              Parsing document…
            </h2>
            <p className="mt-2 text-secondary text-sm font-normal max-w-sm mx-auto">
              We're extracting text from your resume using deep document
              parsing.
            </p>
          </div>
        </div>
      ) : (
        /* Extracted preview + CTA */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Text preview */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-primary">
                Extracted Content
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider border border-success/20">
                Verified
              </span>
            </div>
            <div className="rounded-xl bg-surface border border-border p-6 flex-1">
              <pre className="max-h-[50vh] overflow-y-auto text-xs leading-relaxed text-secondary whitespace-pre-wrap font-mono">
                {extractedText}
              </pre>
            </div>
          </div>

          {/* Action panel */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="rounded-xl border border-border bg-background p-6 flex flex-col gap-5">
              <h3 className="text-base font-semibold text-primary">
                Next: Pipeline Analysis
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Content parsed. Our 3-phase pipeline performs structural
                verification, scoring, and a deep semantic audit.
              </p>
              <div className="space-y-2.5">
                {[
                  "Structural integrity check",
                  "Keyword & Scoring Scan",
                  "Deep Semantic Audit",
                ].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 text-xs font-mono text-muted"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
              <button
                onClick={() => void handleAnalyze()}
                disabled={isInitializing}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-full bg-primary text-background text-sm font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                {isInitializing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Start Analysis Pipeline
              </button>
              <button
                onClick={handleReset}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-full border border-border bg-transparent text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Select Different File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Step 2: Analysis Results ──────────────────────────────────────────
  const stepResults = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">
          Analysis Pipeline
        </h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <ErrorBoundary>
        {pipeline ? (
          <AnalysisPipelineResults pipeline={pipeline} />
        ) : (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-muted font-mono text-xs uppercase tracking-widest">
              Initializing Engine…
            </p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );

  return (
    <StepWizard
      title="Resume Scanner"
      subtitle="Professional-grade ATS audit in 3 steps."
      steps={WIZARD_STEPS}
      currentStep={phaseToStep(phase)}
    >
      {[stepSelect, stepExtract, stepResults]}
    </StepWizard>
  );
}
