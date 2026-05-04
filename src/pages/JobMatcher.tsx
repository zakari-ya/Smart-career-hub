import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { JobMatcherForm } from "../components/jobs/JobMatcherForm";
import { AnalysisResults } from "../components/analysis/AnalysisResults";
import { Analysis } from "../types";
import { toast } from "sonner";

export function JobMatcher() {
  const [isMatching, setIsMatching] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const resumes = useQuery(api.resumes.getMyResumes);
  const createAnalysisRecord = useMutation(api.analyses.createAnalysisRecord);
  const runAnalysis = useAction(api.analyses.runAnalysis);

  const handleMatch = async (resumeId: string, jobDescription: string) => {
    setIsMatching(true);
    setAnalysis(null);

    try {
      // Get the resume's extracted text so the AI has content to compare
      const resume = resumes?.find((r) => r._id === resumeId);
      const resumeText = resume?.extractedText;

      if (!resumeText) {
        toast.warning(
          "This resume has no extracted text. Re-upload as a .txt or .md file for best results. Proceeding with limited data."
        );
      }

      // 1. Create a pending analysis record
      const analysisId = await createAnalysisRecord({
        resumeId: resumeId as Id<"resumes">,
        jobDescription,
        type: "job_match",
      });

      // 2. Run AI analysis server-side
      const result = await runAnalysis({
        analysisId,
        ...(resumeText !== undefined ? { resumeText } : {}),
        jobDescription,
        type: "job_match",
      });

      if (!result) throw new Error("Empty result from AI");

      // 3. Show results
      setAnalysis({
        _id: analysisId,
        userId: "" as Analysis["userId"],
        clerkId: "",
        resumeId: resumeId as Id<"resumes">,
        jobDescription,
        type: "job_match",
        aiModel: "google/gemini-2.5-flash-preview",
        status: "completed",
        result: result as NonNullable<Analysis["result"]>,
        createdAt: Date.now(),
        completedAt: Date.now(),
      });

      toast.success("Job match analysis complete!");
    } catch (error) {
      console.error("[JobMatcher]", error);
      toast.error("Job match failed. Check your OpenRouter API key is set in Convex.");
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Job Matcher</h2>
        <p className="text-muted-foreground">
          Compare your resume against a specific job posting to uncover missing keywords, 
          skill gaps, and get personalized tailoring advice.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <JobMatcherForm onSubmit={handleMatch} isLoading={isMatching} />
          </div>
        </div>
        
        <div className="lg:col-span-7">
          {isMatching && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed bg-muted/10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground animate-pulse">Analyzing match probability and skill gaps...</p>
            </div>
          )}

          {!isMatching && analysis && (
            <AnalysisResults analysis={analysis} />
          )}

          {!isMatching && !analysis && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold tracking-tight">Ready to Match</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select one of your uploaded resumes and paste the job description on the left.
                AI will evaluate your fit and give you specific improvements to make before applying.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
