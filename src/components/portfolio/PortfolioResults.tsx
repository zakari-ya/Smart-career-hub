import { Analysis } from "../../types";
import { ProjectReviewCard } from "./ProjectReviewCard";
import { AnalysisResults } from "../analysis/AnalysisResults";
import { StaggerContainer } from "../animations/StaggerContainer";

interface PortfolioResultsProps {
  analysis: Analysis;
}

export function PortfolioResults({ analysis }: PortfolioResultsProps) {
  if (!analysis.result || analysis.status !== "completed") {
    return <AnalysisResults analysis={analysis} />;
  }

  const improvedDescriptions = analysis.result.improvedDescriptions || [];

  return (
    <div className="flex flex-col gap-24">
      {/* Overview Section */}
      <AnalysisResults analysis={analysis} />
      
      {/* Project Breakdown */}
      {improvedDescriptions.length > 0 && (
        <div className="flex flex-col gap-12 border-t border-border pt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-3xl font-medium text-primary tracking-tight">Repository Insights</h3>
            <p className="text-lg text-secondary font-normal">AI-enhanced READMEs & Professional Descriptions</p>
          </div>
          
          <StaggerContainer className="grid grid-cols-1 gap-8">
            {improvedDescriptions.map((desc, i) => {
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
          </StaggerContainer>
        </div>
      )}
    </div>
  );
}
