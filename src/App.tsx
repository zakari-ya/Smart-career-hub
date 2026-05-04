import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/clerk";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import { useAuth, SignIn, SignUp } from "@clerk/clerk-react";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Pages
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { ResumeScanner } from "./pages/ResumeScanner";
import { PortfolioAuditor } from "./pages/PortfolioAuditor";
import { JobMatcher } from "./pages/JobMatcher";
import { Settings } from "./pages/Settings";

/**
 * ProtectedRoute — guards authenticated pages.
 *
 * Uses `isLoaded` so Convex queries inside children NEVER fire
 * before Clerk has resolved the session. Previously this relied on
 * <SignedIn>/<SignedOut> which could mount children while Clerk was
 * still loading, causing Convex to run queries with no auth token →
 * "Unauthorized" thrown → black screen.
 */
function ProtectedRoute({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const { isLoaded, isSignedIn } = useAuth();

  // Clerk still resolving session — show nothing (avoids premature Convex queries)
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

function App(): React.ReactElement {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />

              {/* Auth Routes */}
              <Route
                path="/sign-in/*"
                element={
                  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                    <SignIn routing="path" path="/sign-in" />
                  </div>
                }
              />
              <Route
                path="/sign-up/*"
                element={
                  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                    <SignUp routing="path" path="/sign-up" />
                  </div>
                }
              />

              {/* Protected Routes — each wrapped in ErrorBoundary so a Convex
                  Unauthorized error can't black-screen the whole app */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Dashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-scanner"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <ResumeScanner />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/portfolio-auditor"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <PortfolioAuditor />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-matcher"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <JobMatcher />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Settings />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
