'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';
import { cn } from '../../lib/utils';

export interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedCard({ children, delay = 0, className, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      className={cn("bg-surface border border-border rounded-[12px] p-6 shadow-sm", className)}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] } }
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
