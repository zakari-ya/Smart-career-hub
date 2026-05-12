'use client';
import { motion } from 'framer-motion';
import React from 'react';
import { cn } from '../../lib/utils';
import { CountUp } from './CountUp';

export interface ScoreBarProps {
  label: string;
  score: number;
  color?: string;
  className?: string;
}

export function ScoreBar({ label, score, color, className }: ScoreBarProps) {
  const getColorClass = (s: number) => {
    if (s >= 80) return 'bg-[#22C55E]';
    if (s >= 60) return 'bg-[#FACC15]';
    return 'bg-[#F87171]';
  };

  return (
    <div className={cn("w-full mb-4 last:mb-0", className)}>
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted font-mono"><CountUp end={score} duration={1.2} />/100</span>
      </div>
      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color ? color : getColorClass(score))}
          style={{ backgroundColor: color ? color : undefined }}
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
