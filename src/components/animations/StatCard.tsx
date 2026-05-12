'use client';
import React from 'react';
import { AnimatedCard } from './AnimatedCard';
import { CountUp } from './CountUp';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string | undefined;
  trendUp?: boolean | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  className?: string | undefined;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, prefix = '', suffix = '', className }: StatCardProps) {
  const isNumber = typeof value === 'number';

  return (
    <AnimatedCard className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold">
          {isNumber ? (
            <CountUp end={value as number} prefix={prefix} suffix={suffix} />
          ) : (
            `${prefix}${value}${suffix}`
          )}
        </span>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", trendUp ? "bg-success/10 text-[#22C55E]" : "bg-error/10 text-[#F87171]")}>
            {trend}
          </span>
        )}
      </div>
    </AnimatedCard>
  );
}
