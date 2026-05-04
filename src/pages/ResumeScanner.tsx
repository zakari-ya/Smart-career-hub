import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResumeUploader } from "../components/resume/ResumeUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Sparkles, FileText, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";

export function ResumeScanner() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  
  const [extractedText, setExtractedText] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [phase, setPhase] = useState<"idle" | "extracting" | "extracted" | "analyzing" | "done">("idle");
  const [error, setError] = useState<string>("");

  const resumes = useQuery(api.resumes.getMyResumes);
  const extractTextAction = useAction(api.extraction.extractText);
  const analyzeResumeAction = useAction(api.analysis.analyzeResume);

  const calculateAccuracy = (text: string) => {
    if (!text) return 0;
    const commonKeywords = ["experience", "education", "skills", "projects", "contact"];
    const found = commonKeywords.filter(k => text.toLowerCase().includes(k)).length;
    return Math.min(Math.round((found / commonKeywords.length) * 100), 100);
  };

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
        fileBase64: "", // Backend will handle retrieval via fileName/storage
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
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setPhase("idle");
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText) return;

    setPhase("analyzing");
    setError("");

    try {
      const result = await analyzeResumeAction({
        extractedText,
        analysisType: "resume",
      });

      if (result.success && result.analysis) {
        interface ResumeResult {
          overallATSScore?: number;
          honestAssessment?: string;
          verdictReason?: string;
          sections?: Record<string, { score: number; feedback: string }>;
          top3Actions?: string[];
          missingKeywords?: string[];
        }
        const aiResult = result.analysis as ResumeResult;

        const mappedAnalysis = {
          _id: "temp",
          userId: "temp",
          clerkId: "temp",
          createdAt: Date.now(),
          status: "completed",
          type: "resume_review",
          aiModel: "gpt-4",
          result: {
            score: aiResult.overallATSScore || 0,
            summary: aiResult.honestAssessment || aiResult.verdictReason || "Analysis completed.",
            strengths: Object.entries(aiResult.sections || {})
              .filter(([, data]) => (data as { score: number }).score >= 70)
              .map(([section, data]) => `${section}: ${(data as { feedback: string }).feedback}`),
            weaknesses: Object.entries(aiResult.sections || {})
              .filter(([, data]) => (data as { score: number }).score < 70)
              .map(([section, data]) => `${section}: ${(data as { feedback: string }).feedback}`),
            suggestions: aiResult.top3Actions || [],
            missingSkills: aiResult.missingKeywords || []
          }
        } as unknown as Analysis;
        setAnalysis(mappedAnalysis);
        setPhase("done");
        setActiveTab("results");
        toast.success("AI Analysis complete!");
      } else {
        setError(result.error || "Analysis failed");
        setPhase("extracted");
        toast.error(result.error || "Analysis failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI service error");
      setPhase("extracted");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto w-full relative">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-noise z-0" />
      
      <div className="flex flex-col space-y-2 relative z-10">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Resume Scanner
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Upload your resume for a professional-grade ATS audit. 
          Uncover hidden gaps and get actionable feedback in seconds.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 relative z-10">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-muted/50 border">
          <TabsTrigger value="upload" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Upload & Manage</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysis} className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Latest Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6 outline-none">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ResumeUploader />
            </div>
            
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select Resume</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-3">
                    {resumes?.map((resume) => (
                      <motion.div
                        key={resume._id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          setSelectedResumeId(resume._id);
                          setPhase("idle");
                          setExtractedText("");
                        }}
                        className={`group flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all ${
                          selectedResumeId === resume._id
                            ? "border-primary bg-primary/[0.02]"
                            : "border-transparent bg-muted/20 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-md ${selectedResumeId === resume._id ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground"}`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{resume.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {resume.fileType.toUpperCase()} · {(resume.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        {selectedResumeId === resume._id && (
                          <div className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
                            Selected
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    className="w-full mt-2 h-11"
                    onClick={handleExtract}
                    disabled={!selectedResumeId || phase === "extracting" || phase === "analyzing"}
                  >
                    {phase === "extracting" ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      "Extract Content"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <AnimatePresence mode="wait">
                {phase === "extracted" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase">Ready</span>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Content Verified
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Accuracy</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${calculateAccuracy(extractedText)}%` }}
                                  className="h-full bg-primary"
                                />
                              </div>
                              <span className="text-xs font-bold">{calculateAccuracy(extractedText)}%</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative group">
                          <div className="bg-slate-950 text-slate-300 border border-slate-800 rounded-lg p-5 max-h-72 overflow-y-auto font-mono text-[11px] leading-relaxed selection:bg-primary selection:text-primary-foreground">
                            {extractedText}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none rounded-b-lg opacity-50" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <Button variant="outline" onClick={() => setPhase("idle")}>
                            Reselect File
                          </Button>
                          <Button 
                            onClick={handleAnalyze} 
                            className="bg-primary hover:bg-primary/90 text-white font-bold"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Run AI Deep Dive
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {phase === "analyzing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center p-12 border rounded-xl bg-muted/5 border-dashed"
                  >
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold tracking-tight">Recruiter-AI at Work</h3>
                    <p className="mt-2 text-muted-foreground text-center max-w-sm">
                      Our "Senior Recruiter" model is auditing your resume for ATS compatibility and skill impact.
                    </p>
                    <div className="mt-8 w-full max-w-xs space-y-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          animate={{ 
                            x: ["-100%", "100%"] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5,
                            ease: "linear" 
                          }}
                        />
                      </div>
                      <p className="text-[10px] uppercase font-bold text-center text-muted-foreground tracking-widest">
                        Performing Keyword Gap Analysis...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/20"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="outline-none">
          {analysis ? (
            <ErrorBoundary fallback={<div className="p-4 text-destructive border rounded-md">Analysis returned empty data</div>}>
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <AnalysisResults analysis={analysis} />
              </div>
            </ErrorBoundary>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl bg-muted/5">
              <Info className="h-8 w-8 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No results to display yet.</p>
              <Button variant="link" onClick={() => setActiveTab("upload")}>Return to Upload</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
