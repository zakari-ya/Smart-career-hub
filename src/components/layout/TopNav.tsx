import { Link, useLocation } from "react-router-dom";
import { UserButton, useAuth } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  FileSearch,
  Github,
  Briefcase,
  Menu,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";

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

  /* Subtle border appears on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /* Close drawer on route change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 h-16 w-full transition-colors duration-200 ${
          scrolled
            ? "bg-[#0D0D12] border-b border-[#2A2A35]"
            : "bg-[#0D0D12]/95 border-b border-[#2A2A35]/60"
        }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 md:px-6">

          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Link
            to={isSignedIn ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 select-none group"
            aria-label="Smart Career Hub home"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#D4A574] transition-opacity group-hover:opacity-90">
              <Zap className="h-4 w-4 text-[#0D0D12]" strokeWidth={2.5} />
            </div>
            <span
              className="text-[15px] font-semibold tracking-tight text-[#F2EFE9]"
              style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
            >
              Smart Career Hub
            </span>
          </Link>

          {/* ── Desktop Nav Links ─────────────────────────────────────── */}
          {isSignedIn && (
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-[4px] transition-colors duration-150 ${
                      active
                        ? "text-[#D4A574]"
                        : "text-[#9B9790] hover:text-[#F2EFE9] hover:bg-[#1E1E28]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    {item.label}
                    {/* Copper underline for active state */}
                    {active && (
                      <span
                        className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-[#D4A574]"
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
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard:
                        "bg-[#16161E] border border-[#2A2A35] shadow-xl",
                      userButtonPopoverActionButton:
                        "text-[#F2EFE9] hover:bg-[#1E1E28]",
                      userButtonPopoverActionButtonText: "text-[#F2EFE9]",
                    },
                  }}
                />
                {/* Hamburger — mobile only */}
                <button
                  id="mobile-menu-toggle"
                  className="flex md:hidden items-center justify-center h-9 w-9 rounded-[4px] text-[#9B9790] hover:text-[#F2EFE9] hover:bg-[#1E1E28] transition-colors"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  aria-expanded={drawerOpen}
                  aria-controls="mobile-drawer"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link
                to="/sign-in"
                className="h-9 px-4 text-sm font-medium rounded-[4px] border border-[#2A2A35] text-[#F2EFE9] hover:border-[#D4A574] hover:text-[#D4A574] transition-colors inline-flex items-center"
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
            className="absolute inset-0 bg-[#0D0D12]/70"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className="absolute inset-y-0 right-0 w-72 bg-[#16161E] border-l border-[#2A2A35] flex flex-col"
            style={{ animation: "slideInRight 0.25s ease-out both" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#2A2A35]">
              <span
                className="text-sm font-semibold text-[#9B9790] uppercase tracking-widest"
                style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
              >
                Menu
              </span>
              <button
                className="flex items-center justify-center h-9 w-9 rounded-[4px] text-[#9B9790] hover:text-[#F2EFE9] hover:bg-[#1E1E28] transition-colors"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer nav links */}
            <nav className="flex flex-col gap-1 p-4 flex-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[4px] text-sm font-medium min-h-[44px] transition-colors ${
                      active
                        ? "bg-[#1E1E28] text-[#D4A574] border-l-2 border-[#D4A574]"
                        : "text-[#9B9790] hover:bg-[#1E1E28] hover:text-[#F2EFE9]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="p-5 border-t border-[#2A2A35]">
              <p className="text-xs text-[#9B9790]">Smart Career Hub</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
