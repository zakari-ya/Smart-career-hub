import { CheckCircle2 } from "lucide-react";

interface StrengthsListProps {
  strengths: string[];
}

export function StrengthsList({ strengths }: StrengthsListProps) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface/50 p-8 border border-border/30">
      <ul className="space-y-6">
        {strengths.map((strength, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-3 w-3 text-success" strokeWidth={3} />
            </div>
            <p className="text-sm leading-relaxed text-secondary font-normal">{strength}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
