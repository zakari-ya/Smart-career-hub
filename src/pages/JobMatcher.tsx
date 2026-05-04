import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { JobMatcherForm } from "../components/jobs/JobMatcherForm";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, Sparkles, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

export function JobMatcher() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [phase, setPhase] = useState<"idle" | "extracting" | "extracted" | "analyzing" | "done">("idle");
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
        fileBase64: "", // Backend will fetch from storage
        fileName: resume.title,
        fileType: resume.fileType,
        ...(resume.fileStorageId ? { storageId: resume.fileStorageId } : {}),
      });

      if (result.success && result.extractedText) {
        setExtractedText(result.extractedText);
        setPhase("extracted");
      } else {
        setError(result.error || "Extraction failed");
        setPhase("idle");
        toast.error(result.error || "Extraction failed");
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
        interface JobMatchResult {
          matchScore?: number;
          honestAssessment?: string;
          matchReason?: string;
          skillsAnalysis?: {
            matchedSkills?: string[];
            missingSkills?: string[];
          };
          experienceGap?: string;
          resumeTailoring?: string[];
          realisticNextSteps?: string[];
        }
        const aiResult = result.analysis as JobMatchResult;
        
        const mappedAnalysis = {
          _id: "temp",
          userId: "temp",
          clerkId: "temp",
          createdAt: Date.now(),
          status: "completed",
          type: "job_match",
          aiModel: "gpt-4",
          result: {
            score: aiResult.matchScore || 0,
            summary: aiResult.honestAssessment || aiResult.matchReason || "Analysis completed.",
            strengths: aiResult.skillsAnalysis?.matchedSkills || [],
            weaknesses: [
              ...(aiResult.skillsAnalysis?.missingSkills || []),
              aiResult.experienceGap
            ].filter(Boolean) as string[],
            suggestions: [
              ...(aiResult.resumeTailoring || []),
              ...(aiResult.realisticNextSteps || [])
            ],
            missingSkills: aiResult.skillsAnalysis?.missingSkills || []
          }
        } as unknown as Analysis;
        setAnalysis(mappedAnalysis);
        setPhase("done");
        toast.success("Job match analysis complete!");
      } else {
        setError(result.error || "Match analysis failed");
        setPhase("extracted");
        toast.error(result.error || "Match analysis failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service error");
      setPhase("extracted");
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-6xl mx-auto w-full relative">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-noise z-0" />

      <div className="flex flex-col space-y-2 relative z-10">
        <h2 className="text-4xl font-bold tracking-tight">Job Matcher</h2>
        <p className="text-muted-foreground text-lg">
          Quantify your alignment with any role. Our AI analyzes the "hidden requirements" in job descriptions.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 relative z-10">
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-6"
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <JobMatcherForm 
                  onSubmit={handleInitialSubmit} 
                  isLoading={phase === "extracting" || phase === "analyzing"} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {phase === "extracting" && (
              <motion.div
                key="extracting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex h-80 flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed bg-muted/5 p-12 text-center"
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <FileText className="absolute inset-0 m-auto h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg tracking-tight">Accessing Resume Data</h3>
                <p className="text-sm text-muted-foreground max-w-xs italic">
                  One moment, we're parsing your document to prepare for the AI comparison.
                </p>
              </motion.div>
            )}

            {phase === "extracted" && (
              <motion.div
                key="extracted"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="border-primary/20 bg-primary/[0.02] shadow-xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        Ready for Comparison
                      </CardTitle>
                      <div className="text-[10px] font-bold px-2 py-1 bg-primary text-primary-foreground rounded uppercase tracking-tighter">
                        Content Verified
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      We've successfully extracted your resume text. Click below to begin the deep-match analysis against the job description.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="relative">
                      <div className="bg-background border-2 border-slate-200 dark:border-slate-800 rounded-lg p-5 max-h-64 overflow-y-auto font-mono text-[11px] leading-relaxed">
                        {extractedText}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none opacity-60" />
                    </div>
                    <Button 
                      onClick={handleRunMatch} 
                      className="w-full bg-primary hover:bg-primary/90 shadow-lg h-14 text-lg font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Sparkles className="mr-3 h-6 w-6" />
                      Generate Match Report
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {phase === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
                  <CardContent className="pt-10 pb-10 flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">Simulating Recruiter Review</h3>
                    <p className="text-muted-foreground text-center max-w-sm mb-8">
                      Our AI is currently cross-referencing your experience with every bullet point in the job description.
                    </p>
                    
                    <div className="w-full max-w-md space-y-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Cross-Referencing Skills</span>
                        <span className="text-[10px] font-mono text-muted-foreground">Running...</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          animate={{ width: ["10%", "90%", "30%", "70%"] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {phase === "done" && analysis && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <ErrorBoundary fallback={<div className="p-4 text-destructive border rounded-md">Analysis returned empty data</div>}>
                  <AnalysisResults analysis={analysis} />
                </ErrorBoundary>
              </motion.div>
            )}

            {phase === "idle" && !analysis && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/10 p-12 text-center"
              >
                <div className="p-4 rounded-full bg-muted/30 mb-6">
                  <Search className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight">Alignment Report</h3>
                <p className="text-muted-foreground max-w-sm leading-relaxed">
                  Provide your target job description and select a resume to begin. 
                  We'll analyze skill gaps, experience alignment, and tailoring opportunities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-5 text-sm text-destructive bg-destructive/5 rounded-xl border-2 border-destructive/20"
            >
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-base">Match Analysis Halted</p>
                <p className="opacity-90 mt-0.5">{error}</p>
                <Button variant="link" className="p-0 h-auto text-destructive font-bold mt-2 hover:underline" onClick={() => setPhase("idle")}>
                  Try again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
