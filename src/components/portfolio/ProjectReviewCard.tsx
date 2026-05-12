import { Github, Star, GitFork, ExternalLink, Sparkles } from "lucide-react";
import { AnimatedCard } from "../animations/AnimatedCard";

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
    <AnimatedCard className="group flex flex-col p-0 overflow-hidden transition-all hover:border-accent">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/20 bg-background/50">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-medium text-primary tracking-tight">{name}</h4>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-accent transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted">
            {language && (
              <span className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-accent" />
                {language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" /> {stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3" /> {forks}
            </span>
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-background border border-border/50">
          <Github className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-8 border-b md:border-b-0 md:border-r border-border/20">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-4">Current README</p>
          <p className="text-sm leading-relaxed text-secondary italic">
            "{originalDescription || "No description provided."}"
          </p>
        </div>
        <div className="p-8 bg-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.5} />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Optimized Suggestion</p>
          </div>
          <p className="text-sm leading-relaxed text-primary font-medium">
            {improvedDescription}
          </p>
          <div className="mt-6 pt-4 border-t border-accent/10">
            <p className="text-[10px] font-bold text-accent/60 uppercase tracking-widest">
              Action: Update repository "About" section
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
