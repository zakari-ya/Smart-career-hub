import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Github, 
  Briefcase, 
  Settings, 
  User
} from "lucide-react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Scanner", href: "/resume-scanner", icon: FileText },
  { name: "Portfolio Auditor", href: "/portfolio-auditor", icon: Github },
  { name: "Job Matcher", href: "/job-matcher", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { isSignedIn } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-background border-r border-border/30 hidden lg:flex flex-col">
      <div className="flex flex-col h-full px-6 py-10">
        {/* Brand */}
        <Link to="/" className="mb-12 flex flex-col gap-1">
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-accent">
            Smart Career
          </span>
          <span className="text-xs font-medium text-muted tracking-widest">
            HUB / INTELLIGENCE
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 py-3 text-[13px] transition-all duration-200",
                  isActive 
                    ? "text-accent font-semibold" 
                    : "text-muted hover:text-accent font-medium"
                )}
              >
                <div className="relative flex items-center justify-center">
                  {isActive && (
                    <div className="absolute -left-6 h-4 w-1 bg-accent rounded-r-full" />
                  )}
                  <item.icon 
                    className={cn(
                      "h-4.5 w-4.5 transition-colors",
                      isActive ? "text-accent" : "text-muted/60 group-hover:text-accent"
                    )} 
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-8 flex flex-col gap-6">
          <div className="p-4 rounded-card bg-surface border border-border/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
              Current Plan
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">Pro Member</span>
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-4 px-2">
            {isSignedIn ? (
              <>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8 rounded-sm border border-border/50 shadow-none"
                    }
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Account</span>
                  <button 
                    onClick={() => {}} 
                    className="text-[10px] text-muted hover:text-accent transition-colors text-left font-medium"
                  >
                    View profile
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/sign-in"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
