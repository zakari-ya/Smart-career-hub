'use client';
import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '../../lib/utils';

gsap.registerPlugin(ScrollTrigger);

export interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, duration = 1.2, delay = 0, prefix = '', suffix = '', className }: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!nodeRef.current) return;
    
    gsap.fromTo(
      nodeRef.current,
      { innerText: 0 },
      {
        innerText: end,
        duration: duration,
        delay: delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: nodeRef.current,
          start: "top 90%",
          once: true,
        },
        snap: { innerText: 1 },
        onUpdate: function() {
          if (nodeRef.current) {
            nodeRef.current.textContent = `${prefix}${Math.ceil(Number(this.targets()[0].innerText))}${suffix}`;
          }
        }
      }
    );
  }, { scope: nodeRef, dependencies: [end, prefix, suffix, duration, delay] });

  return <span ref={nodeRef} className={cn("inline-block", className)}>{prefix}0{suffix}</span>;
}
