import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { useAppAuth } from "./hooks/useAppAuth";
import { Toaster } from "sonner";
import { Sidebar } from "./components/layout/Sidebar";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { cn } from "./lib/utils";

// Pages
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { ResumeScanner } from "./pages/ResumeScanner";
import { PortfolioAuditor } from "./pages/PortfolioAuditor";
import { JobMatcher } from "./pages/JobMatcher";
import { Settings } from "./pages/Settings";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";

function ProtectedRoute({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  const { isLoaded, isSignedIn } = useAppAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

import { MobileNav } from "./components/layout/MobileNav";
import { TopNavbar } from "./components/layout/TopNavbar";

function RootLayout() {
  const location = useLocation();

  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");
  const isAppRoute = !isLandingPage && !isAuthPage;

  return (
    <div className="flex min-h-screen bg-background text-primary selection:bg-accent/20 selection:text-accent">
      {isAppRoute ? (
        <>
          <Sidebar />
          <MobileNav />
        </>
      ) : (
        !isAuthPage && <TopNavbar />
      )}
      <main
        id="main-content"
        className={cn(
          "flex-1",
          isAppRoute
            ? "lg:ml-60 pt-16 lg:pt-0 overflow-hidden"
            : !isAuthPage
              ? "pt-16"
              : ""
        )}
      >
        {isAppRoute ? (
          // App pages manage their own internal layout (StepWizard fills viewport)
          <Outlet />
        ) : (
          <div className={cn(
            "mx-auto",
            isLandingPage ? "max-w-[1400px] px-6 lg:px-12" : "max-w-[1200px] p-6 lg:p-12"
          )}>
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}


function App(): React.ReactElement {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <div className="min-h-screen bg-background text-primary font-sans selection:bg-accent/20 selection:text-accent">
          <Routes>
            <Route element={<RootLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />

              {/* Auth Routes */}
              <Route
                path="/sign-in/*"
                element={
                  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                    <SignIn />
                  </div>
                }
              />
              <Route
                path="/sign-up/*"
                element={
                  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                    <SignUp />
                  </div>
                }
              />

              {/* Protected Routes */}
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
