/**
 * StepWizard — viewport-locked card wizard for SaaS inner pages.
 *
 * The outer container is fixed to the remaining viewport height (no page scroll).
 * Each step fills that space; content that overflows scrolls *inside* the card.
 * Transitions use Framer Motion: outgoing card slides up, incoming slides from below.
 */
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface WizardStep {
  id: string;
  label: string;
}

export interface StepWizardProps {
  /** Step definitions — drives the progress indicator */
  steps: WizardStep[];
  /** Zero-based index of the currently active step */
  currentStep: number;
  /** One child per step — only the active child is rendered */
  children: React.ReactNode[];
  /** Page title shown in the sticky header */
  title: string;
  /** Optional subtitle shown below the title */
  subtitle?: string;
  /** Extra classes for the root element */
  className?: string;
}

const cardVariants = {
  enter: {
    opacity: 0,
    y: 24,
    scale: 0.99,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export function StepWizard({
  steps,
  currentStep,
  children,
  title,
  subtitle,
  className,
}: StepWizardProps) {
  const activeChild = Array.isArray(children) ? children[currentStep] : children;

  return (
    <div
      className={cn(
        // Fill the viewport below the top-nav (nav = 3.5rem = 56px)
        "flex flex-col w-full h-[calc(100vh-3.5rem)] overflow-hidden",
        className
      )}
    >
      {/* ── Sticky wizard header ─────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-border bg-background px-6 py-4 md:px-10">
        <div className="mx-auto max-w-4xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Title */}
          <div>
            <h1 className="text-xl font-semibold text-primary tracking-tight leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-secondary font-normal">
                {subtitle}
              </p>
            )}
          </div>

          {/* Step progress pills */}
          <nav
            className="flex items-center gap-1.5"
            aria-label="Progress"
            role="list"
          >
            {steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={step.id}
                  role="listitem"
                  className="flex items-center gap-1.5"
                  aria-current={active ? "step" : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-300",
                        active
                          ? "bg-primary text-background"
                          : done
                            ? "bg-primary/20 text-primary"
                            : "bg-surface text-muted border border-border"
                      )}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        active ? "text-primary" : "text-muted"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-1 h-px w-8 rounded-full transition-colors duration-500",
                        done ? "bg-primary/40" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Step card area ───────────────────────────────────────────────── */}
      {/* This div fills the remaining height; the card itself scrolls internally */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={cardVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">
              {activeChild}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
