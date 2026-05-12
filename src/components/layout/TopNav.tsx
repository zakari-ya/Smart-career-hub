import { Link, useLocation } from "react-router-dom";
import { UserButton, useAuth } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  FileSearch,
  Github,
  Briefcase,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard",         href: "/dashboard",         icon: LayoutDashboard },
  { label: "Resume Scanner",    href: "/resume-scanner",    icon: FileSearch },
  { label: "Portfolio Auditor", href: "/portfolio-auditor", icon: Github },
  { label: "Job Matcher",       href: "/job-matcher",       icon: Briefcase },
];

export function TopNav() {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 h-14 w-full bg-background transition-shadow duration-200",
          scrolled ? "shadow-[0_1px_0_0_var(--border)]" : "border-b border-border"
        )}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 md:px-6">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            to={isSignedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2 select-none group"
            aria-label="Smart Career Hub home"
          >
            <span className="text-[14px] font-semibold tracking-tight text-primary">
              Smart Career Hub
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────────────────── */}
          {isSignedIn && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 text-sm rounded-md transition-colors duration-150",
                      active
                        ? "text-primary font-medium"
                        : "text-secondary hover:text-primary hover:bg-surface font-normal"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                    {item.label}
                    {/* Active underline */}
                    {active && (
                      <span
                        className="absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* ── Right Side ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-7 w-7",
                      userButtonPopoverCard: "shadow-lg border border-border",
                    },
                  }}
                />
                {/* Hamburger — mobile only */}
                <button
                  id="mobile-menu-toggle"
                  className="flex md:hidden items-center justify-center h-8 w-8 rounded-md text-secondary hover:text-primary hover:bg-surface transition-colors"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={drawerOpen}
                  aria-controls="mobile-drawer"
                >
                  <Menu className="h-4.5 w-4.5" />
                </button>
              </>
            ) : (
              <Link
                to="/sign-in"
                className="h-8 px-4 text-sm font-medium rounded-md border border-border text-secondary hover:text-primary hover:border-primary transition-colors inline-flex items-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer (slide from right) ─────────────────────────────── */}
      {drawerOpen && (
        <div
          id="mobile-drawer"
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-primary/20"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="absolute inset-y-0 right-0 w-72 bg-background border-l border-border flex flex-col"
            style={{ animation: "slideInRight 0.2s ease-out both" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-border">
              <span className="text-xs font-bold text-muted uppercase tracking-[0.2em]">
                Menu
              </span>
              <button
                className="flex items-center justify-center h-8 w-8 rounded-md text-secondary hover:text-primary hover:bg-surface transition-colors"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer nav links */}
            <nav className="flex flex-col gap-0.5 p-3 flex-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium min-h-[40px] transition-colors",
                      active
                        ? "bg-surface text-primary"
                        : "text-secondary hover:bg-surface hover:text-primary"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="p-5 border-t border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Smart Career Hub
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
