import { cn } from "../../lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreRing({ 
  score, 
  size = 140, 
  strokeWidth = 2,
  className 
}: ScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = "stroke-error";
  if (score >= 80) colorClass = "stroke-success";
  else if (score >= 60) colorClass = "stroke-accent";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-border/50"
        />
        {/* Progress Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth * 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("fill-none transition-all duration-1000 ease-out", colorClass)}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold text-primary tracking-tighter">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">ATS Score</span>
      </div>
    </div>
  );
}
