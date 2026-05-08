import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { Briefcase, Menu } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";

export function Navbar() {
  const isOffline = useUiStore((state) => state.isOfflineMode);
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return `text-sm font-medium transition-colors ${
      location.pathname === path
        ? "text-primary underline underline-offset-4"
        : "text-secondary hover:text-primary"
    }`;
  };

  return (
    <header className="fixed top-0 z-40 w-full bg-transparent">
      <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2 text-primary">
            <Briefcase className="h-6 w-6 stroke-[1.5]" />
            <span className="text-lg font-semibold tracking-tight">Smart Career Hub</span>
          </Link>
          {isOffline && (
            <span className="text-[10px] font-mono tracking-wider uppercase text-error px-2 py-0.5 rounded-full border border-error/20">
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <SignedIn>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className={getLinkClass("/dashboard")}>Dashboard</Link>
              <Link to="/resume" className={getLinkClass("/resume")}>Resume Scanner</Link>
              <Link to="/portfolio" className={getLinkClass("/portfolio")}>Portfolio Auditor</Link>
              <Link to="/jobs" className={getLinkClass("/jobs")}>Job Matcher</Link>
              <Link to="/linkedin" className={getLinkClass("/linkedin")}>LinkedIn Analyzer</Link>
            </nav>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8 rounded-full" } }} />
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/sign-up" className="bg-accent text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary transition-colors">
              Get Started
            </Link>
          </SignedOut>
          <button className="md:hidden text-primary">
            <Menu className="h-6 w-6 stroke-[1.5]" />
          </button>
        </div>
      </div>
    </header>
  );
}
