import { AlertCircle } from "lucide-react";

interface WeaknessesListProps {
  weaknesses: string[];
}

export function WeaknessesList({ weaknesses }: WeaknessesListProps) {
  if (!weaknesses || weaknesses.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface/50 p-8 border border-border/30">
      <ul className="space-y-6">
        {weaknesses.map((weakness, index) => (
          <li key={index} className="flex items-start gap-4">
            <div className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-error/10">
              <AlertCircle className="h-3 w-3 text-error" strokeWidth={3} />
            </div>
            <p className="text-sm leading-relaxed text-secondary font-normal">{weakness}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
