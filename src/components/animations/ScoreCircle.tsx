'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '../../lib/utils';
import { CountUp } from './CountUp';

gsap.registerPlugin(ScrollTrigger);

export interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function ScoreCircle({ score, size = 160, strokeWidth = 12, className, label }: ScoreCircleProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const targetOffset = circumference - (score / 100) * circumference;

  useGSAP(() => {
    if (!circleRef.current || !containerRef.current) return;
    
    gsap.fromTo(circleRef.current,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: targetOffset,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.3,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          once: true,
        }
      }
    );
  }, { scope: containerRef, dependencies: [score, circumference, targetOffset] });

  const getColor = (s: number) => {
    if (s >= 80) return '#16A34A'; // success
    if (s >= 60) return '#CA8A04'; // warning
    return '#DC2626'; // error
  };

  const strokeColor = getColor(score);

  return (
    <div ref={containerRef} className={cn("relative flex flex-col items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90" style={{ willChange: "transform" }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ willChange: "stroke-dashoffset" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold" style={{ color: strokeColor }}>
          <CountUp end={score} duration={1.5} delay={0.3} />
        </span>
        {label && <span className="text-sm text-muted mt-1">{label}</span>}
      </div>
    </div>
  );
}
