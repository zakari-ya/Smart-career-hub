import { cn } from "../../lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({ 
  score, 
  size = 120, 
  strokeWidth = 8,
  className 
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = "text-rose-500/80";
  if (score >= 80) colorClass = "text-emerald-500/80";
  else if (score >= 60) colorClass = "text-amber-500/80";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-white/5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("fill-none transition-all duration-1000 ease-out", colorClass)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-medium tracking-tighter text-foreground/90">{score}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Score</span>
      </div>
    </div>
  );
}
