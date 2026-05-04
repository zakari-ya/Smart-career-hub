import { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ResumeUploader } from "../components/resume/ResumeUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function ResumeScanner() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);

  const resumes = useQuery(api.resumes.getMyResumes);
  const createAnalysisRecord = useMutation(api.analyses.createAnalysisRecord);
  const runAnalysis = useAction(api.analyses.runAnalysis);

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      toast.error("Select a resume first.");
      return;
    }

    const resume = resumes?.find((r) => r._id === selectedResumeId);
    const resumeText = resume?.extractedText;

    if (!resumeText) {
      toast.warning(
        "No text found in this resume. Re-upload as .txt or .md for best results."
      );
    }

    setIsAnalyzing(true);
    try {
      const analysisId = await createAnalysisRecord({
        resumeId: selectedResumeId as Id<"resumes">,
        type: "resume_review",
      });

      const result = await runAnalysis({
        analysisId,
        ...(resumeText !== undefined ? { resumeText } : {}),
        type: "resume_review",
      });

      if (!result) throw new Error("Empty result from AI");

      setCurrentAnalysis({
        _id: analysisId,
        userId: "" as Analysis["userId"],
        clerkId: "",
        resumeId: selectedResumeId as Id<"resumes">,
        type: "resume_review",
        aiModel: "google/gemini-2.5-flash-preview",
        status: "completed",
        result: result as NonNullable<Analysis["result"]>,
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      setActiveTab("results");
      toast.success("Resume analysis complete!");
    } catch (error) {
      console.error("[ResumeScanner]", error);
      toast.error("Analysis failed. Check your OpenRouter API key is set in Convex.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Resume Scanner</h2>
        <p className="text-muted-foreground">
          Upload your resume to get an AI-powered ATS review, formatting checks, and impact analysis.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="upload">Upload &amp; Manage</TabsTrigger>
          <TabsTrigger value="results" disabled={!currentAnalysis}>Latest Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ResumeUploader />
            </div>
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Your Resumes</CardTitle>
                  <CardDescription>
                    Select a resume and click Analyze to run an AI review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resumes === undefined && (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  )}
                  {resumes?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No resumes yet. Upload one above.</p>
                  )}
                  {resumes?.map((resume) => (
                    <div
                      key={resume._id}
                      onClick={() => setSelectedResumeId(resume._id)}
                      className={`flex items-center justify-between rounded-[2px] border p-3 cursor-pointer transition-colors ${
                        selectedResumeId === resume._id
                          ? "border-primary bg-primary/5"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{resume.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resume.fileType.toUpperCase()} · {(resume.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {selectedResumeId === resume._id && (
                        <span className="text-xs font-medium text-primary">Selected</span>
                      )}
                    </div>
                  ))}

                  {resumes && resumes.length > 0 && (
                    <Button
                      className="w-full mt-2"
                      onClick={handleAnalyze}
                      disabled={!selectedResumeId || isAnalyzing}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isAnalyzing ? "Analyzing…" : "Analyze Selected Resume"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="space-y-6">
          {currentAnalysis ? (
            <AnalysisResults analysis={currentAnalysis} />
          ) : (
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-lg">
              <p className="text-muted-foreground">No analysis selected.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
