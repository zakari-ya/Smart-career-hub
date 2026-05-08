import { ArrowRight } from "lucide-react";

interface SuggestionCardProps {
  suggestions: string[];
}

export function SuggestionCard({ suggestions }: SuggestionCardProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {suggestions.map((suggestion, index) => (
        <div 
          key={index} 
          className="group flex flex-col gap-6 p-8 rounded-card bg-surface border border-border/30 transition-all hover:-translate-y-1 hover:border-accent"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-background border border-border/50 text-[10px] font-bold text-accent font-mono">
            0{index + 1}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-primary font-medium">
              {suggestion}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
