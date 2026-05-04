import { Analysis } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ScoreRing } from "./ScoreRing";
import { StrengthsList } from "./StrengthsList";
import { WeaknessesList } from "./WeaknessesList";
import { SuggestionCard } from "./SuggestionCard";

interface AnalysisResultsProps {
  analysis: Analysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (analysis.status === "pending" || analysis.status === "processing") {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="h-6 w-6 animate-spin rounded-full border-[1.5px] border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">AI is analyzing your document...</p>
      </div>
    );
  }

  if (analysis.status === "failed") {
    return (
      <Card className="border-red-500/50 bg-red-500/10">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Analysis Failed</CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            {analysis.errorMessage || "There was an error processing your request. Please try again."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!analysis.result) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardContent className="flex flex-col items-center p-6 md:flex-row md:items-start md:space-x-8">
          <div className="flex-shrink-0 mb-8 md:mb-0">
            <ScoreRing score={analysis.result.score} size={140} strokeWidth={4} />
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-medium tracking-tight">Executive Summary</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {analysis.result.summary}
              </p>
            </div>
            
            {/* Conditional extra data based on type */}
            {analysis.result.missingSkills && analysis.result.missingSkills.length > 0 && (
              <div className="mt-6 border-t border-white/5 pt-6">
                <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Missing Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.result.missingSkills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center rounded-[2px] bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-foreground/80">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <StrengthsList strengths={analysis.result.strengths} />
        <WeaknessesList weaknesses={analysis.result.weaknesses} />
      </div>

      <SuggestionCard suggestions={analysis.result.suggestions} />

      {analysis.result.improvedDescriptions && analysis.result.improvedDescriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Improved Project Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.result.improvedDescriptions.map((desc, i) => (
                <div key={i} className="rounded-[2px] border border-white/5 bg-white/[0.02] p-5 font-mono text-[13px] leading-relaxed text-foreground/90">
                  {desc}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
