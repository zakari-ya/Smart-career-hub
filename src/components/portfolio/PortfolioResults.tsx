import { Analysis } from "../../types";
import { ProjectReviewCard } from "./ProjectReviewCard";
import { AnalysisResults } from "../analysis/AnalysisResults";

interface PortfolioResultsProps {
  analysis: Analysis;
}

export function PortfolioResults({ analysis }: PortfolioResultsProps) {
  // We can reuse the AnalysisResults for the high-level summary
  // and append the ProjectReviewCards below it.
  
  if (!analysis.result || analysis.status !== "completed") {
    return <AnalysisResults analysis={analysis} />;
  }

  // Example mockup for parsing improved descriptions back into project reviews
  // In a real scenario, the AI might return structured JSON with {name, original, improved}
  const improvedDescriptions = analysis.result.improvedDescriptions || [];

  return (
    <div className="space-y-8">
      <AnalysisResults analysis={analysis} />
      
      {improvedDescriptions.length > 0 && (
        <div className="space-y-6 animate-fade-in animate-delay-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">Project Audits</h3>
            <p className="text-sm text-muted-foreground">AI-enhanced READMEs & Descriptions</p>
          </div>
          
          <div className="grid gap-6">
            {improvedDescriptions.map((desc, i) => {
              // Assuming desc is formatted like "ProjectName: The new description..."
              // This is a fallback if the AI didn't return a proper object.
              const split = desc.split(":");
              const name = split.length > 1 ? split[0] : `Project ${i + 1}`;
              const improved = split.length > 1 ? split.slice(1).join(":").trim() : desc;

              return (
                <ProjectReviewCard
                  key={i}
                  name={name || `Project ${i + 1}`}
                  originalDescription="Description fetched from GitHub."
                  improvedDescription={improved}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
