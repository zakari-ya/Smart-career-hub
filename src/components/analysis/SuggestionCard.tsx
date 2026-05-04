import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface SuggestionCardProps {
  suggestions: string[];
}

export function SuggestionCard({ suggestions }: SuggestionCardProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="border-l-2 border-l-blue-500/50 bg-transparent shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center text-lg font-medium text-foreground tracking-tight">
          <Lightbulb className="mr-2 h-5 w-5" />
          Actionable Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start">
              <div className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-[2px] bg-white/5 text-[11px] font-medium text-muted-foreground border border-white/10">
                {index + 1}
              </div>
              <p className="text-[14px] leading-relaxed text-muted-foreground pt-0.5">{suggestion}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
