import { Link, Outlet, useLocation } from "react-router-dom";
import { UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { LayoutDashboard, FileText, Briefcase, Github, Settings, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { InstallPrompt } from "./InstallPrompt";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Resume Scanner", href: "/resume-scanner", icon: FileText },
  { title: "Portfolio Auditor", href: "/portfolio-auditor", icon: Github },
  { title: "Job Matcher", href: "/job-matcher", icon: Briefcase },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ROOT CAUSE FIX #2: Sync the Clerk user into the Convex `users` table.
  // Without this call, the users table is always empty and every Convex
  // mutation that does `if (!user) throw "User not found"` fails silently.
  const syncUser = useMutation(api.auth.syncUser);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]);

  // If not signed in, just render the outlet (Landing page)
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold sm:inline-block">Smart Career Hub</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link to="/sign-in">Sign In</Link>
              </Button>
            </nav>
          </div>
        </header>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background selection:bg-primary/20 noise-overlay">
      
      {/* Mobile Top Navigation */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-background/80 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-primary">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground font-display">Career Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Responsive Grid */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row md:p-6 lg:p-8 gap-6">
        
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col md:flex">
          <div className="flex items-center gap-3 px-2 pb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-primary shadow-sm shadow-primary/20">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-medium tracking-tight">Smart Career Hub</span>
          </div>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-[2px] px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-white/5 text-foreground" 
                      : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 px-2">
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <span className="text-sm font-medium text-muted-foreground">Account</span>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-over Menu */}
        <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-3/4 max-w-sm border-r border-white/5 bg-background px-6 py-6 shadow-2xl">
            <div className="flex items-center justify-between pb-8">
              <span className="font-display text-lg font-medium">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-[2px] px-3 py-3 text-sm font-medium ${
                      isActive ? "bg-white/5 text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Floating Island Main Content */}
        <main className="flex-1 overflow-hidden md:rounded-[4px] md:border md:border-white/5 md:bg-muted/30 md:shadow-sm">
          <div className="h-full w-full overflow-y-auto p-4 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>

      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
