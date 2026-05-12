# Smart Career Hub 🚀

**Smart Career Hub** is a production-grade, AI-powered Progressive Web App (PWA) designed to provide career intelligence. It serves as a comprehensive toolkit for developers and professionals, offering features like a resume scanner, portfolio auditor, and intelligent job matcher.

Built with a strict **Security-First Engineering** mandate, this project demonstrates senior-level architectural practices, offline-first capabilities, and premium editorial design.

🌐 **Live Demo:** [Smart Career Hub on Vercel](#) *(Replace with actual Vercel URL)*

---

## ✨ Key Features

- **🧠 AI Resume Scanner:** Analyzes your resume using advanced LLMs (Claude 3.5 Sonnet, GPT-4o, Mistral) via OpenRouter, providing actionable feedback, ATS scoring, and strength identification.
- **🔍 Portfolio Auditor:** Automatically audits GitHub portfolios to evaluate code quality, structure, and professional presentation.
- **💼 Job Matcher:** Intelligently matches your profile and resume against specific job descriptions to highlight gaps and tailor your application.
- **📱 Progressive Web App (PWA):** Fully installable on mobile and desktop devices.
- **📴 Offline-First Architecture:** Queue resume uploads and view past analyses offline with IndexedDB (Dexie.js) and Background Sync.
- **🔒 Enterprise-Grade Security:** Strict server-side validation, BOLA prevention, rate limiting, and robust authentication.
- **🎨 Premium Editorial Design:** Built with custom design tokens, Radix UI primitives, Framer Motion, and GSAP for a dynamic, "anti-AI-generated" aesthetic.

---

## 🛠️ Technology Stack

We've chosen a modern, high-performance stack optimized for developer experience and user satisfaction:

### Frontend
- **Framework:** React 19 + TypeScript 5.4 + Vite 6
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Animations:** Framer Motion + GSAP
- **State Management:** TanStack Query v5 (Server State) + Zustand (Client State)
- **Offline Storage:** Dexie.js (IndexedDB)
- **PWA:** Vite PWA Plugin + Workbox

### Backend & Infrastructure
- **Database & Serverless Logic:** Convex (Database, Functions, File Storage, Scheduler)
- **Authentication:** Clerk (JWT-based, social login, secure session management)
- **AI Gateway:** OpenRouter API
- **Hosting:** Vercel (Frontend) + Convex (Backend)

### Testing & Quality Assurance
- **Unit Testing:** Vitest
- **Integration Testing:** `convex-test`
- **End-to-End (E2E):** Playwright
- **Code Quality:** ESLint + Strict TypeScript Configuration

---

## 🛡️ Security-First Architecture

Security is not an afterthought; it is a fundamental design constraint of this project.

1. **Zero Client-Side AI Calls:** External AI APIs (OpenRouter) are never called directly from the browser. All requests securely route through Convex server actions.
2. **Implicit Trust Denial:** `userId` is never trusted from the client. Identity is exclusively derived from `ctx.auth.getUserIdentity()` inside Convex functions.
3. **Secret Management:** Clerk tokens and OpenRouter keys are strictly managed via environment variables and never exposed to the client bundle.
4. **Strict Authorization (BOLA Prevention):** Every Convex query and mutation verifies authentication and strictly checks document ownership (`doc.userId === authUser.subject`) before execution.
5. **Robust Validation & Sanitization:** All user inputs (text, files) are validated server-side using Convex validators and Zod schemas. AI-generated HTML is sanitized using DOMPurify before rendering.
6. **Rate Limiting:** Mandatory rate limiting is enforced on all AI endpoints to prevent abuse.

---

## 🏗️ Project Structure

```text
smart-career-hub/
├── AGENTS.md                 # Engineering guidelines and rules
├── convex/                   # Backend — ALL server logic lives here
│   ├── schema.ts             # Convex database schema
│   ├── auth.ts               # Clerk JWT integration
│   ├── resumes.ts            # Resume CRUD + storage
│   ├── analyses.ts           # AI analysis orchestration
│   └── lib/                  # Utilities (OpenRouter, Rate Limiter, Validators)
├── src/                      # Frontend Application
│   ├── components/           # React Components (UI, Resume, Analysis, Layout)
│   ├── hooks/                # Custom React Hooks (Auth, Queries, Offline Queue)
│   ├── lib/                  # Client Utilities & Configuration
│   ├── stores/               # Zustand state stores
│   ├── styles/               # Global CSS & Tailwind configuration
│   └── types/                # Shared TypeScript definitions
├── public/                   # PWA Manifest, Service Worker, Icons
└── tests/                    # Vitest, Convex-test, and Playwright suites
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v20+)
- npm or pnpm
- Accounts for [Convex](https://convex.dev/), [Clerk](https://clerk.com/), and [OpenRouter](https://openrouter.ai/)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/smart-career-hub.git
cd smart-career-hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create `.env.local` in the root directory for frontend variables:
```env
VITE_CONVEX_URL=your_convex_deployment_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Configure the following secrets in your **Convex Dashboard** under Settings > Environment Variables:
- `CLERK_JWT_ISSUER_DOMAIN`
- `OPENROUTER_API_KEY`
- `OPENROUTER_HTTP_REFERER` (Your domain, e.g., http://localhost:5173 for local dev)

### 4. Start the Development Servers
You need to run both the Vite frontend and the Convex backend simultaneously.

Terminal 1 (Convex Backend):
```bash
npm run convex:dev
```

Terminal 2 (Vite Frontend):
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

---

## 🧪 Testing

Ensure code quality and security by running the test suites before committing:

```bash
# Type checking
npm run type-check

# ESLint
npm run lint

# Unit tests (Vitest)
npm run test:unit

# Integration tests (Convex)
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e
```

---

## 🚢 Deployment

The frontend of this application is configured to be seamlessly deployed on **Vercel**, while the backend is hosted on **Convex**.

1. Connect your GitHub repository to Vercel.
2. Ensure the Build Command is `npm run build` and the Output Directory is `dist`.
3. Add the `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_CONVEX_URL` to your Vercel Environment Variables.
4. For Convex, ensure your production environment variables are properly configured in the Convex Dashboard and run `npx convex deploy` to deploy your backend functions.

---
*Built with precision, security, and aesthetics in mind.*
