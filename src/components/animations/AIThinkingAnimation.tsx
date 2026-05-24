/**
 * AIThinkingAnimation.tsx
 *
 * A polished "AI is thinking" animation shown while each pipeline phase is
 * processing. Consists of:
 *   - Three animated pulsing orbs (staggered)
 *   - A cycling status message that subtly changes over time
 *   - A thin scanning progress bar
 *
 * Usage:
 *   <AIThinkingAnimation text="Performing deep semantic analysis..." />
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export interface AIThinkingAnimationProps {
  text: string;
}

// Cycle through these messages so the user knows work is actively happening
const THINKING_MESSAGES = [
  "Reading between the lines...",
  "Comparing against 10,000+ resumes...",
  "Applying STAR method evaluation...",
  "Cross-referencing industry benchmarks...",
  "Formulating recommendations...",
];

export function AIThinkingAnimation({ text }: AIThinkingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle sub-messages every 2.8 s
  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % THINKING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 py-12">
      {/* Orb cluster */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer slow pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-accent/20"
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-accent/30"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
        {/* Core icon */}
        <motion.div
          className="relative z-10 w-14 h-14 rounded-full bg-surface border border-accent/40 flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-6 h-6 text-accent" />
        </motion.div>
      </div>

      {/* Primary label */}
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-primary tracking-wide">{text}</p>

        {/* Cycling sub-message */}
        <div className="h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-xs text-muted font-mono"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {THINKING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Scanning progress bar */}
      <div className="w-48 h-0.5 bg-border/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-accent/70 rounded-full"
          animate={{ x: ["-100%", "300%"] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Staggered dot row */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent/60"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
