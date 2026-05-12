import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobMatcherForm } from "../components/jobs/JobMatcherForm";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { toast } from "sonner";
import { Sparkles, AlertCircle, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { StepWizard } from "../components/ui/StepWizard";

type Phase = "idle" | "extracting" | "extracted" | "analyzing" | "done";

const WIZARD_STEPS = [
  { id: "configure", label: "Configure" },
  { id: "process", label: "Process" },
  { id: "results", label: "Results" },
];

function phaseToStep(phase: Phase): number {
  if (phase === "idle") return 0;
  if (phase === "done") return 2;
  return 1;
}

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

    let text = resume.extractedText ?? "";
    if (!text) {
      try {
        const result = await extractTextAction({
          fileBase64: "",
          fileName: resume.title,
          fileType: resume.fileType,
          resumeId: resume._id,
          ...(resume.fileStorageId ? { storageId: resume.fileStorageId } : {}),
        });
        if (result.success && result.extractedText) {
          text = result.extractedText;
        } else {
          setError(result.error ?? "Extraction failed");
          setPhase("idle");
          toast.error(result.error ?? "Extraction failed");
          return;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Extraction error");
        setPhase("idle");
        return;
      }
    }
    setExtractedText(text);
    setPhase("extracted");
  };

  const handleRunMatch = async () => {
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
          skillsAnalysis?: { matchedSkills?: string[]; missingSkills?: string[] };
          experienceGap?: string;
          resumeTailoring?: string[];
          realisticNextSteps?: string[];
        }
        const ai = result.analysis as AIMatchResult;
        setAnalysis({
          _id: "temp", userId: "temp", clerkId: "temp",
          createdAt: Date.now(), status: "completed", type: "job_match", aiModel: "gpt-4o",
          result: {
            score: ai.matchScore ?? 0,
            summary: ai.honestAssessment ?? ai.matchReason ?? "Analysis completed.",
            strengths: ai.skillsAnalysis?.matchedSkills ?? [],
            weaknesses: [...(ai.skillsAnalysis?.missingSkills ?? []), ai.experienceGap].filter(Boolean) as string[],
            suggestions: [...(ai.resumeTailoring ?? []), ...(ai.realisticNextSteps ?? [])],
            missingSkills: ai.skillsAnalysis?.missingSkills ?? [],
          },
        } as unknown as Analysis);
        setPhase("done");
        toast.success("Job match analysis complete!");
      } else {
        setError(result.error ?? "Match analysis failed");
        setPhase("extracted");
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

  // Step 0
  const stepConfigure = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-primary mb-1">Match Parameters</h2>
        <p className="text-sm text-secondary">Select your resume and paste the job description.</p>
      </div>
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" /><p>{error}</p>
        </div>
      )}
      <div className="rounded-xl border border-border bg-background p-6">
        <JobMatcherForm onSubmit={handleInitialSubmit} isLoading={isLoading} />
      </div>
    </div>
  );

  // Step 1
  const stepProcess = (
    <div className="flex flex-col gap-8">
      {(phase === "extracting" || phase === "analyzing") && (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border border-border bg-surface flex items-center justify-center">
              <Loader2 className="h-9 w-9 animate-spin text-primary" strokeWidth={1} />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-7 w-7 text-primary animate-pulse" strokeWidth={1} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-primary tracking-tight">
              {phase === "extracting" ? "Preparing Resume…" : "Quantifying Match…"}
            </h2>
            <p className="mt-2 text-secondary text-sm max-w-sm mx-auto">
              {phase === "extracting"
                ? "Parsing your document for comparison."
                : "Cross-referencing your experience with every requirement."}
            </p>
          </div>
        </div>
      )}
      {phase === "extracted" && (
        <div className="flex flex-col gap-5 max-w-lg mx-auto w-full">
          <div className="rounded-xl border border-border bg-background p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success border border-success/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-primary">Resume Parsed</h3>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-success">Ready</span>
            </div>
            <p className="text-sm text-secondary leading-relaxed">Resume data cached. Run the AI comparison now.</p>
            <button
              onClick={() => void handleRunMatch()}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-full bg-primary text-background text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-4 w-4" />Generate Match Report
            </button>
            <button
              onClick={handleReset}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              <RotateCcw className="h-4 w-4" />Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2
  const stepResults = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-primary">Match Results</h2>
        <button onClick={handleReset} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors">
          <RotateCcw className="h-3.5 w-3.5" />New Match
        </button>
      </div>
      {analysis && <ErrorBoundary><AnalysisResults analysis={analysis} /></ErrorBoundary>}
    </div>
  );

  return (
    <StepWizard
      title="Job Matcher"
      subtitle="Quantify your alignment with any role."
      steps={WIZARD_STEPS}
      currentStep={phaseToStep(phase)}
    >
      {[stepConfigure, stepProcess, stepResults]}
    </StepWizard>
  );
}
