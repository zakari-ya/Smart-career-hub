import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface WeaknessesListProps {
  weaknesses: string[];
}

export function WeaknessesList({ weaknesses }: WeaknessesListProps) {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <Card className="border-l-2 border-l-rose-500/50 bg-transparent shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center text-lg font-medium text-foreground tracking-tight">
          <AlertCircle className="mr-2 h-5 w-5" />
          Areas for Improvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start text-sm">
              <span className="mr-3 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500/50" />
              <span className="text-[14px] leading-relaxed text-muted-foreground">{weakness}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
