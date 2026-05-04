import { Github, Star, GitFork, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ProjectReviewCardProps {
  name: string;
  originalDescription: string;
  improvedDescription: string;
  stars?: number;
  forks?: number;
  language?: string;
  url?: string;
}

export function ProjectReviewCard({
  name,
  originalDescription,
  improvedDescription,
  stars = 0,
  forks = 0,
  language,
  url,
}: ProjectReviewCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:border-white/20 group">
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center text-lg font-medium tracking-tight">
            <Github className="mr-3 h-5 w-5 text-muted-foreground" />
            {name}
          </CardTitle>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
          {language && (
            <span className="flex items-center">
              <span className="mr-1 h-2 w-2 rounded-full bg-primary"></span>
              {language}
            </span>
          )}
          <span className="flex items-center">
            <Star className="mr-1 h-3 w-3" /> {stars}
          </span>
          <span className="flex items-center">
            <GitFork className="mr-1 h-3 w-3" /> {forks}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 pt-5 md:grid-cols-2 text-[14px]">
        <div className="space-y-3">
          <h4 className="font-display text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/70">Original Description</h4>
          <p className="rounded-[2px] bg-white/[0.02] border border-white/5 p-4 text-muted-foreground leading-relaxed">
            {originalDescription || "No description provided."}
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-display text-[11px] font-semibold tracking-widest uppercase text-primary/80">AI Suggestion</h4>
          <p className="rounded-[2px] bg-primary/5 border border-primary/10 p-4 font-medium text-foreground/90 leading-relaxed">
            {improvedDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
