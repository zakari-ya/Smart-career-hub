import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./lib/clerk";
import { Toaster } from "sonner";
import { Sidebar } from "./components/layout/Sidebar";
import { useAuth, useUser, SignIn, SignUp } from "@clerk/clerk-react";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { cn } from "./lib/utils";

// Pages
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { ResumeScanner } from "./pages/ResumeScanner";
import { PortfolioAuditor } from "./pages/PortfolioAuditor";
import { JobMatcher } from "./pages/JobMatcher";
import { Settings } from "./pages/Settings";

function ProtectedRoute({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  const { isLoaded, isSignedIn } = useAuth();

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
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const syncUser = useMutation(api.auth.syncUser);

  const isLandingPage = location.pathname === "/";
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");
  const isAppRoute = !isLandingPage && !isAuthPage;

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUser({
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? user.firstName ?? "User",
        avatarUrl: user.imageUrl ?? undefined,
      }).catch((err: unknown) => {
        console.error("[syncUser] Failed to sync user to Convex:", err);
      });
    }
  }, [isLoaded, isSignedIn, user, syncUser]);

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
          "flex-1 min-h-screen",
          isAppRoute ? "lg:ml-60 pt-16 lg:pt-0" : !isAuthPage ? "pt-16" : ""
        )}
      >
        <div className={cn(
          "mx-auto",
          isLandingPage ? "max-w-[1400px] px-6 lg:px-12" : "max-w-[1200px] p-6 lg:p-12"
        )}>
          <Outlet />
        </div>
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
