import os

replacements = [
    ("src/components/layout/InstallPrompt.tsx", "const [deferredPrompt, setDeferredPrompt] = useState<any>(null);", "// eslint-disable-next-line @typescript-eslint/no-explicit-any\n  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);"),
    ("src/components/portfolio/ProjectReviewCard.tsx", "CardDescription, ", ""),
    ("src/components/portfolio/ProjectReviewCard.tsx", "import { Badge } from \"../ui/badge\";\n", ""),
    ("src/components/ui/badge.tsx", "export const badgeVariants =", "// eslint-disable-next-line react-refresh/only-export-components\nexport const badgeVariants ="),
    ("src/components/ui/button.tsx", "export const buttonVariants =", "// eslint-disable-next-line react-refresh/only-export-components\nexport const buttonVariants ="),
    ("src/hooks/useOfflineQueue.ts", "import { db, OfflineUpload } from '../lib/db';", "import { db } from '../lib/db';"),
    ("src/hooks/useOfflineQueue.ts", "  }, []);", "    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);"),
    ("src/hooks/useOfflineQueue.ts", "(registration as any).sync.register('sync-resumes');", "// eslint-disable-next-line @typescript-eslint/no-explicit-any\n          (registration as any).sync.register('sync-resumes');"),
    ("src/pages/Landing.tsx", "ArrowRight, ", ""),
    ("src/pages/PortfolioAuditor.tsx", "const [analysis, setAnalysis] = useState<Analysis | null>(null);", "const [analysis] = useState<Analysis | null>(null);"),
    ("src/pages/ResumeScanner.tsx", "import { useQuery } from \"convex/react\";\nimport { api } from \"../../convex/_generated/api\";\n", ""),
    ("src/pages/ResumeScanner.tsx", "import { AnalysisResults } from \"../components/analysis/AnalysisResults\";\n", ""),
    ("src/pages/Settings.tsx", "import { useMutation } from \"convex/react\";\nimport { api } from \"../../convex/_generated/api\";\n", ""),
    ("tests/integration/resumes.test.ts", "import { test, expect, describe, beforeEach } from \"vitest\";", "import { test, expect, describe } from \"vitest\";"),
    ("tests/integration/resumes.test.ts", "const userBId = await t.run(api.auth.syncUser, {", "await t.run(api.auth.syncUser, {"),
    ("tests/unit/validators.test.ts", "const summary = validateAiResponse(\"resume_review\", mockData);", "validateAiResponse(\"resume_review\", mockData);")
]

for file_path, target, replacement in replacements:
    full_path = os.path.join("/home/zakariya/Downloads/smart_career-hub", file_path)
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            content = f.read()
        content = content.replace(target, replacement)
        with open(full_path, "w") as f:
            f.write(content)
