import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";

/**
 * Hook to manage and orchestrate the three-phase resume analysis pipeline.
 */
export function useAnalyzePipeline(resumeId: Id<"resumes"> | null) {
  const initPipeline = useMutation(api.analyzePipeline.initPipeline);
  
  const pipeline = useQuery(api.analyzePipeline.getPipelineByResume, 
    resumeId ? { resumeId } : "skip"
  );
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPipeline = async () => {
    if (!resumeId) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      // 1. Initialize Pipeline. The backend orchestrator will take over.
      await initPipeline({ resumeId });
    } catch (err) {
      console.error("Pipeline initiation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to start analysis pipeline.");
      setIsInitializing(false);
    }
  };

  // Sync isInitializing state with pipeline status
  useEffect(() => {
    if (pipeline?.overallStatus === "completed" || pipeline?.overallStatus === "failed") {
      setIsInitializing(false);
    }
  }, [pipeline?.overallStatus]);

  return {
    pipeline,
    isInitializing,
    error,
    startPipeline,
    currentPhase: pipeline ? 
      (pipeline.phase3.status === "completed" ? 3 : 
       (pipeline.phase2.status === "completed" ? 2 : 1)) 
      : 0
  };
}
