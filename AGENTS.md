# AGENTS.md — Smart Career Hub
## AI Agent Development Guide & Security-First Engineering Rules

> **Role:** You are the lead engineer building The Smart Career Hub — a production-grade PWA that uses AI to help developers improve their resumes and portfolios.
> **Mandate:** Security is not a feature. It is a design constraint. Every line of code must pass the security checklist before it is written.
> **Philosophy:** Build like a real product, not a tutorial. Every decision must justify itself against maintainability, performance, and security.

---

## 1. Project Identity

**Name:** Smart Career Hub  
**Type:** Progressive Web App (PWA) — installable on mobile, works offline  
**Domain:** AI-powered career intelligence platform (resume scanner, portfolio auditor, job matcher)  
**Target:** Production-ready fullstack application demonstrating senior engineering practices

**Tech Stack:**
- **Frontend:** React 19 + TypeScript 5.4 + Vite 6 + Tailwind CSS v4
- **State:** TanStack Query v5 (server) + Zustand (client UI)
- **Backend:** Convex (serverless database + functions + file storage + scheduler)
- **Auth:** Clerk (JWT-based, social login, session management)
- **AI:** OpenRouter API (unified gateway for GPT-4o, Claude 3.5 Sonnet, Mistral)
- **PWA:** Vite PWA Plugin + Workbox + Dexie.js (IndexedDB offline queue)
- **Design:** Radix UI primitives + Framer Motion + Lucide React + custom design tokens
- **Testing:** Vitest (unit) + Playwright (E2E) + `convex-test` (integration)

---

## 2. Security-First Non-Negotiable Rules

### 2.1 The Golden Rules (Violate = Revert Immediately)

- **RULE-S1:** NEVER call OpenRouter or any external AI API from the client/browser. ALL AI requests flow through Convex `action` functions only.
- **RULE-S2:** NEVER trust a `userId` passed from the client. Derive identity exclusively from `ctx.auth.getUserIdentity()` inside Convex functions.
- **RULE-S3:** NEVER store Clerk tokens, OpenRouter keys, or any secrets in localStorage, IndexedDB, or client bundles.
- **RULE-S4:** EVERY Convex query and mutation MUST verify authentication before executing logic. Return `null` or throw — never proceed with a null user.
- **RULE-S5:** EVERY document fetch MUST check ownership (BOLA prevention). Verify `doc.userId === authUser.subject` before returning data.
- **RULE-S6:** NEVER expose raw error messages from external APIs to the client. Return generic messages; log details server-side in Convex.
- **RULE-S7:** ALL user inputs (files, text, URLs) MUST be validated using Convex validators AND Zod schemas before processing.
- **RULE-S8:** AI-generated content MUST be sanitized with DOMPurify before rendering in the DOM.
- **RULE-S9:** Rate limiting MUST be enforced on all AI endpoints (max 10 analyses/hour for free users, 100/hour for pro).
- **RULE-S10:** File uploads MUST be restricted to 5MB, PDF/Markdown/TXT only, scanned for malware patterns server-side.

### 2.2 Authentication & Authorization Pattern

```typescript
// ✅ CORRECT — Derive identity from auth token, never from args
export const getMyResumes = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");
    return ctx.db.query("resumes")
      .withIndex("by_clerk_id", q => q.eq("clerkId", user.subject))
      .collect();
  }
});

// ❌ WRONG — Never accept userId from client
export const getResumes = query({
  args: { userId: v.id("users") },  // NEVER DO THIS
  handler: async (ctx, { userId }) => { return ... }
});
```

### 2.3 Convex Security Checklist (Every Function)

Before marking any Convex function as complete, verify:
- [ ] Calls `ctx.auth.getUserIdentity()` and handles null
- [ ] Validates all arguments with Convex validators (`v.string()`, `v.id()`, etc.)
- [ ] Checks document ownership before returning or modifying
- [ ] Uses indexes for efficient ownership lookups (no full table scans)
- [ ] Returns minimal data (never return entire documents if only 2 fields needed)
- [ ] Logs security-relevant events (failed auth, ownership violations)

---

## 3. Engineering Workflow (How We Build)

### 3.1 The Development Loop

We follow a strict Plan → Implement → Verify → Document cycle:

1. **Plan:** Write the task in `task.md` with acceptance criteria and security implications
2. **Implement:** Write code following all rules in this file
3. **Verify:** Run type-check, lint, unit tests, and manual security review
4. **Document:** Update `walkthrough.md` with changes and verification evidence

### 3.2 Before Writing Any Feature

- [ ] Threat model the feature using STRIDE (Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation)
- [ ] Define the Convex schema with proper indexes
- [ ] Define the Clerk authorization rules
- [ ] Write the test cases BEFORE implementation (TDD for business logic)
- [ ] Identify if the feature works offline and plan the IndexedDB queue strategy

### 3.3 Before Every Commit

Run these commands in order. If any fail, fix before committing:

```bash
npm run lint          # ESLint with no-floating-promises rule
npm run type-check    # TypeScript strict mode — zero errors
npm run test:unit     # Vitest coverage >70%
npm run convex:check  # Validates Convex schema + functions compile
```

### 3.4 Before Every Merge (PR Requirements)

- [ ] All unit tests pass with >70% coverage
- [ ] Integration tests pass (`convex-test` for all queries/mutations)
- [ ] E2E tests pass (Playwright for critical user journeys)
- [ ] Security review: BOLA test, auth bypass test, rate limit test
- [ ] Preview environment deployed and manually verified
- [ ] Code review completed (PR <400 lines if possible)
- [ ] No secrets in diff (scan for `sk-`, `Bearer`, API keys)

---

## 4. Architecture & File Organization

### 4.1 Project Structure

```
smart-career-hub/
├── AGENTS.md                 # This file — the engineering bible
├── convex/                   # Backend — ALL server logic lives here
│   ├── schema.ts             # Single source of truth for data model
│   ├── auth.ts               # Clerk JWT verification helpers
│   ├── lib/
│   │   ├── openrouter.ts     # OpenRouter client with retry/fallback logic
│   │   ├── rateLimiter.ts    # Per-user rate limiting for AI endpoints
│   │   ├── validators.ts     # Zod schemas for AI responses
│   │   └── security.ts       # Audit logging, IP validation helpers
│   ├── users.ts              # User profile queries/mutations
│   ├── resumes.ts            # Resume CRUD + file storage
│   ├── analyses.ts           # AI analysis orchestration (actions)
│   ├── portfolio.ts          # GitHub portfolio audit logic
│   ├── jobs.ts               # Job matching + job tracker
│   └── _generated/           # Auto-generated by Convex (DO NOT EDIT)
├── src/
│   ├── components/
│   │   ├── ui/               # Radix primitives wrapped (Button, Input, Dialog)
│   │   ├── resume/           # Upload, viewer, version list
│   │   ├── analysis/         # Results display, score rings, suggestions
│   │   ├── portfolio/        # GitHub URL input, audit results
│   │   ├── jobs/             # Job tracker kanban, job matcher form
│   │   └── layout/           # Nav, PWA install prompt, offline banner
│   ├── hooks/
│   │   ├── useAuth.ts        # Clerk auth wrapper with loading states
│   │   ├── useAnalysis.ts    # TanStack Query for analysis data
│   │   ├── useOfflineQueue.ts # Dexie.js offline upload queue
│   │   └── useConvexRealtime.ts # Real-time subscription helpers
│   ├── lib/
│   │   ├── convex.ts         # Convex client configuration
│   │   ├── clerk.ts          # Clerk provider + JWT template config
│   │   ├── utils.ts          # cn() helper, formatters, sanitizers
│   │   └── constants.ts      # App constants (limits, enums, config)
│   ├── stores/
│   │   └── uiStore.ts        # Zustand store for modals, filters, toasts
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types/interfaces
│   ├── styles/
│   │   └── globals.css       # Tailwind directives + CSS custom properties
│   └── App.tsx               # Root component with routing
├── public/
│   ├── manifest.json         # PWA manifest (display: standalone)
│   ├── sw.js                 # Service worker (auto-generated by Vite PWA)
│   └── icons/                # PWA icons (192x192, 512x512)
├── tests/
│   ├── unit/                 # Vitest tests mirror src/ structure
│   ├── integration/          # convex-test integration tests
│   └── e2e/                  # Playwright E2E specs
├── .github/
│   └── workflows/
│       └── ci.yml            # CI: lint → type-check → test → deploy
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json             # Strict mode enabled
└── package.json
```

### 4.2 File Naming Conventions

- **Components:** PascalCase + `.tsx` (e.g., `ResumeUploader.tsx`)
- **Hooks:** camelCase + `use` prefix + `.ts` (e.g., `useAnalysis.ts`)
- **Convex functions:** camelCase + `.ts` (e.g., `resumes.ts` contains `getMyResumes`, `createResume`)
- **Utilities:** camelCase + `.ts` (e.g., `rateLimiter.ts`)
- **Tests:** Same name as file + `.test.ts` or `.spec.ts` (e.g., `resumes.test.ts`)
- **Types:** PascalCase interfaces in `types/index.ts`

---

## 5. Code Standards

### 5.1 TypeScript (Strict Mode — Zero Exceptions)

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

- **NO `any` type.** Use `unknown` with type guards if type is uncertain.
- **NO implicit returns.** Every function must explicitly return a value or `void`.
- **NO non-null assertions (`!`).** Use optional chaining (`?.`) and null checks.
- **ALL async functions** must handle errors with try/catch or `.catch()`.

### 5.2 React 19 Patterns

- **Function components ONLY.** No class components.
- **Named exports ONLY.** No default exports for components.
- **Props interface REQUIRED.** Every component must define its props interface.
- **Server state** goes in TanStack Query (Convex hooks).
- **Client state** (modals, filters, animation triggers) goes in Zustand.
- **NO prop drilling** beyond 2 levels. Use context or Zustand.

```typescript
// ✅ CORRECT
export interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: string) => void;
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  return <div>...</div>;
}

// ❌ WRONG
export default function ResumeCard(props) {  // No default exports, no any
  return <div>...</div>;
}
```

### 5.3 Convex Patterns

- **Schema first:** Every table must have indexes for all query patterns.
- **Separate concerns:** Queries read, mutations write, actions call external APIs.
- **NO floating promises:** Always await Convex calls; ESLint enforces this.
- **Rate limit ALL actions:** Especially AI endpoints (OpenRouter is expensive).
- **Audit log:** Every security-relevant action logs to an `auditLogs` table.

```typescript
// ✅ CORRECT — Action with rate limiting + audit logging
export const createAnalysis = action({
  args: {
    resumeId: v.id("resumes"),
    jobDescription: v.optional(v.string()),
    type: v.union(
      v.literal("resume_review"),
      v.literal("job_match"),
      v.literal("portfolio_audit")
    )
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new Error("Unauthorized");

    // Rate limit check
    await checkRateLimit(ctx, user.subject, "analysis", 10);

    // Ownership verification
    const resume = await ctx.db.get(args.resumeId);
    if (!resume || resume.clerkId !== user.subject) {
      throw new Error("Forbidden");
    }

    // Call OpenRouter through secure proxy
    const result = await callOpenRouter(ctx, args);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: user.subject,
      action: "analysis_created",
      resourceId: args.resumeId,
      timestamp: Date.now()
    });

    return result;
  }
});
```

### 5.4 OpenRouter Integration Rules

- **NEVER** call OpenRouter from the client.
- **ALWAYS** implement fallback routing: Try Claude 3.5 Sonnet → fallback to GPT-4o → fallback to Mistral.
- **ALWAYS** validate AI responses with Zod schemas before storing in Convex.
- **ALWAYS** truncate inputs to fit token limits (resume text max 8000 chars, job description max 4000 chars).
- **NEVER** include multiple users' data in a single prompt. Isolate per-user contexts.

```typescript
// ✅ CORRECT — Secure OpenRouter call with fallback
async function callOpenRouter(ctx: ActionCtx, payload: AnalysisPayload) {
  const models = [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "mistralai/mistral-7b-instruct"
  ];

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: buildPrompt(payload),
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const parsed = analysisResultSchema.parse(data); // Zod validation
      return parsed;
    } catch (err) {
      console.error(`Model ${model} failed:`, err);
      continue; // Try next fallback
    }
  }

  throw new Error("All AI models failed");
}
```

---

## 6. Design System (Anti-AI-Generated Aesthetic)

### 6.1 Design Philosophy

We build an **editorial, intentional interface** — not a generic SaaS template. The design should feel like a premium productivity tool (think Linear, Vercel, Notion) — not a startup landing page.

**FORBIDDEN (The "AI Look"):**
- ❌ Gradient backgrounds (especially purple/blue)
- ❌ Glassmorphism cards with heavy blur
- ❌ Floating 3D illustrations or generic hero blobs
- ❌ Centered everything with massive padding
- ❌ Mixed icon families (never mix FontAwesome + Lucide + Emojis)
- ❌ Rounded corners on everything (use purposeful radius: 0px, 4px, 8px only)

**REQUIRED:**
- ✅ Solid colors with subtle noise texture overlay (`opacity-[0.03]`)
- ✅ 1px borders for elevation (`border-slate-200 dark:border-slate-800`)
- ✅ Purposeful shadows ONLY on hover/elevation change (`shadow-sm`, never `shadow-2xl`)
- ✅ Asymmetric editorial layouts using CSS Grid
- ✅ Strong typographic hierarchy (max 2 fonts)
- ✅ Dark mode as first-class citizen
- ✅ Generous whitespace — let content breathe

### 6.2 Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        destructive: "hsl(var(--destructive))",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "8px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      }
    }
  }
};
```

### 6.3 Component Patterns

- **Use Radix UI primitives** as the base layer (accessibility handled).
- **Wrap primitives** in your own components with design tokens applied.
- **Framer Motion** for: page transitions, list stagger entrances, layout animations.
- **NO animation** on initial page load (respects `prefers-reduced-motion`).
- **Sonner** for toast notifications (position: bottom-right).

```typescript
// ✅ CORRECT — Custom button using Radix + Tailwind tokens
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-8",
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);
```

---

## 7. PWA & Offline-First Rules

### 7.1 PWA Requirements

- **Manifest:** `display: standalone`, `theme_color` matches design system, icons at 192x192 and 512x512.
- **Service Worker:** Auto-generated by Vite PWA Plugin with Workbox runtime caching.
- **Install Prompt:** Custom UI component (not browser default) triggered after 30 seconds of engagement.

### 7.2 Offline Strategy

| Feature | Offline Behavior |
|---------|-----------------|
| Resume Upload | Queue in IndexedDB (Dexie.js) → sync when online via Background Sync API |
| View Past Analyses | Cached via Workbox runtime caching → available offline |
| Create New Analysis | Show offline banner → queue request → notify when complete |
| Dashboard Data | Convex real-time sync + local cache → show stale data with timestamp |

### 7.3 Service Worker Configuration

```typescript
// vite.config.ts
VitePWA({
  registerType: "autoUpdate",
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.convex\.site\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "convex-api",
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff2)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "assets",
          expiration: { maxEntries: 50 }
        }
      }
    ]
  },
  manifest: {
    name: "Smart Career Hub",
    short_name: "CareerHub",
    description: "AI-powered resume and portfolio intelligence",
    theme_color: "#0f172a",
    background_color: "#0f172a",
    display: "standalone",
    start_url: "/",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  }
});
```

---

## 8. Testing Standards

### 8.1 Testing Pyramid

- **Unit Tests (80%):** Vitest — pure logic, utilities, validators, prompt builders
- **Integration Tests (15%):** `convex-test` — Convex functions in isolation (auth, BOLA, rate limiting)
- **E2E Tests (5%):** Playwright — critical user journeys only

### 8.2 Required Test Coverage

Every PR must include tests for:
- [ ] Authentication gates (unauthenticated = rejected)
- [ ] Authorization (User A cannot access User B's data)
- [ ] Input validation (malformed data = rejected gracefully)
- [ ] Business logic (analysis scoring, skill matching)
- [ ] Error handling (API failures, network errors)

### 8.3 Security Test Cases (Mandatory)

```typescript
// Example: BOLA test for resume access
it("should prevent users from accessing other users' resumes", async () => {
  const userA = await createTestUser("user-a");
  const userB = await createTestUser("user-b");
  const resume = await createTestResume(userB.id);

  await expect(
    getMyResumes.runAs(userA, { resumeId: resume.id })
  ).rejects.toThrow("Forbidden");
});
```

---

## 9. Build, Deploy & CI/CD

### 9.1 Commands

```bash
# Development
npm run dev              # Vite dev server + Convex dev
npm run convex:dev       # Convex local dev server

# Quality gates
npm run lint             # ESLint --max-warnings=0
npm run type-check       # tsc --noEmit
npm run test:unit        # Vitest with coverage
npm run test:integration # convex-test suite
npm run test:e2e         # Playwright

# Build
npm run build            # Vite production build
npm run convex:deploy    # Deploy Convex functions
```

### 9.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit -- --coverage
      - run: npm run convex:check
      - run: npm run test:e2e
      - run: npm run build
```

### 9.3 Environment Variables (Convex)

These must be set in Convex dashboard (NOT in client .env):
- `CLERK_JWT_ISSUER_DOMAIN`
- `CLERK_JWT_AUDIENCE`
- `OPENROUTER_API_KEY`
- `OPENROUTER_HTTP_REFERER` (your domain)

Client-side (Vercel):
- `VITE_CONVEX_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`

---

## 10. Common Patterns & Anti-Patterns

### ✅ DO

- Use `ctx.auth.getUserIdentity()` for every authenticated function
- Validate AI responses with Zod before storing
- Use Convex indexes for all queries (`withIndex`)
- Implement optimistic updates with TanStack Query
- Sanitize HTML with DOMPurify before rendering AI output
- Use `useCallback` and `useMemo` for expensive computations
- Keep components under 150 lines; extract early
- Use `loading` and `error` states for ALL async UI

### ❌ DON'T

- Pass `userId` as a function argument from client
- Store API keys in client bundles or localStorage
- Use `any` type or `@ts-ignore`
- Call external APIs directly from React components
- Return full database documents when only 2 fields needed
- Use `alert()` or `console.log` in production code
- Ignore ESLint warnings (treat as errors)
- Mix Tailwind arbitrary values with design tokens (`text-[14px]`)

---

## 11. Guest Mode Security

Guest users can try AI features without creating an account:
- Generate temporary Convex tokens with limited scope (read-only + analysis creation only)
- IP-based rate limiting: max 3 analyses per IP per 24 hours
- Auto-delete guest data after 24 hours (Convex scheduler)
- Guest analyses stored in separate `guestAnalyses` table (isolated from authenticated users)
- NO access to dashboard, resume history, or job tracker

---

## 12. Audit & Monitoring

### 12.1 Audit Log Schema

```typescript
// In convex/schema.ts
auditLogs: defineTable({
  userId: v.string(),
  action: v.union(
    v.literal("resume_uploaded"),
    v.literal("analysis_created"),
    v.literal("analysis_failed"),
    v.literal("login"),
    v.literal("logout"),
    v.literal("data_export_requested")
  ),
  resourceId: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  timestamp: v.number(),
}).index("by_user", ["userId", "timestamp"])
  .index("by_action", ["action", "timestamp"]);
```

### 12.2 Monitoring Checklist

- [ ] Sentry configured for frontend error tracking
- [ ] Convex function logs reviewed weekly
- [ ] Rate limit violations logged and alerted
- [ ] Dependency audit (`npm audit`) run in CI weekly
- [ ] Failed auth attempts monitored for brute force patterns

---

## 13. GDPR & Data Compliance

- **Data Export:** Endpoint to export all user data as JSON (resumes, analyses, job trackers)
- **Right to Deletion:** `deleteUserAccount` mutation removes ALL user data from Convex (cascade delete)
- **Data Retention:** Guest data auto-deleted after 24h; inactive accounts flagged after 1 year
- **Minimal PII:** Only store email and name from Clerk. No phone, address, or DOB.
- **Consent:** Explicit opt-in for AI processing of resume data during onboarding

---

## 14. Final Checklist Before Shipping

- [ ] All 10 Security Rules verified across codebase
- [ ] BOLA tests pass (User A cannot access User B data)
- [ ] Rate limiting tested and verified (429 returned correctly)
- [ ] PWA Lighthouse audit score >90 (Performance, Accessibility, Best Practices, PWA)
- [ ] Offline functionality manually tested (airplane mode)
- [ ] OpenRouter fallback chain tested (simulate provider failure)
- [ ] Clerk session rotation working (logout invalidates tokens)
- [ ] GDPR deletion endpoint tested end-to-end
- [ ] No secrets in repository (scan complete)
- [ ] Rollback procedure documented

---

> **Remember:** This is not a tutorial project. This is a production application. Every decision must be defensible in a code review. Build it like you are shipping it to 10,000 users tomorrow.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
