import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Scanner", href: "/resume-scanner" },
  { name: "Auditor", href: "/portfolio-auditor" },
  { name: "Matcher", href: "/job-matcher" },
  { name: "Settings", href: "/settings" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
          Smart Career
        </span>
      </Link>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-primary"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border/30 p-6 flex flex-col gap-6 animate-fade-in shadow-xl">
          <nav className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-lg font-semibold tracking-tight transition-colors",
                  location.pathname === item.href ? "text-accent" : "text-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="pt-6 border-t border-border/30 flex items-center justify-between">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted">Account</span>
              </div>
            ) : (
              <Link 
                to="/sign-in" 
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold uppercase tracking-widest text-accent"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
