import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  Briefcase,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Settings,
  FileSearch,
  Github,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const visitorLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const toolLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Resume Scanner", path: "/resume-scanner", icon: FileSearch },
  { label: "Portfolio Auditor", path: "/portfolio-auditor", icon: Github },
  { label: "Job Matcher", path: "/job-matcher", icon: Briefcase },
  { label: "Settings", path: "/settings", icon: Settings },
];

export function TopNav() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isVisitor = location.pathname === "/";

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToHash = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (location.pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setDrawerOpen(false);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-[64px] w-full bg-background">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Smart Career Hub home"
          >
            <Briefcase className="h-5 w-5 text-primary stroke-[1.5]" />
            <span className="text-lg font-semibold tracking-tight text-primary">
              Smart Career Hub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {isVisitor
              ? visitorLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={(e) => scrollToHash(e, item.href)}
                    className="font-medium text-sm text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))
              : toolLinks.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`font-medium text-sm transition-colors ${
                        isActive
                          ? "text-primary underline underline-offset-4"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
          </nav>

          {/* Right Area (CTA or Avatar) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate("/sign-in")}
                    className="text-sm font-medium text-secondary hover:text-primary transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate("/sign-up")}
                    className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-primary"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-surface transition-colors"
                  >
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="Avatar"
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-medium text-background">
                        {user?.firstName?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-primary">
                      {user?.firstName || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-secondary" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-background py-1 shadow-sm">
                      <div className="px-4 py-2 text-xs text-muted">
                        {user?.primaryEmailAddress?.emailAddress}
                      </div>
                      <div className="my-1 h-px bg-border" />
                      <button
                        onClick={() => signOut(() => navigate("/"))}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-error hover:bg-surface"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="flex items-center justify-center rounded p-1 text-secondary transition-colors hover:text-primary md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-200 md:hidden ${
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[300px] transform bg-background border-l border-border flex flex-col pt-16 transition-transform duration-200 ease-out ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <button
            className="absolute right-4 top-4 rounded p-2 text-secondary hover:bg-surface hover:text-primary"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6 stroke-[1.5]" />
          </button>

          {!user ? (
            <div className="px-6 pb-6">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setDrawerOpen(false)}
              >
                <Briefcase className="h-5 w-5 text-primary stroke-[1.5]" />
                <span className="text-lg font-semibold tracking-tight text-primary">
                  Smart Career Hub
                </span>
              </Link>
            </div>
          ) : (
            <div className="px-6 pb-6 flex items-center gap-3">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-background">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium text-primary">
                  {user?.fullName || "User"}
                </span>
                <span className="text-xs text-muted">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-1 px-4 flex-1">
            {isVisitor ? (
              visitorLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={(e) => scrollToHash(e, item.href)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary hover:bg-surface"
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                {toolLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-primary hover:bg-surface"
                  >
                    <item.icon className="h-5 w-5 text-secondary" />
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="border-t border-border p-4 flex flex-col gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => navigate("/sign-in")}
                  className="w-full rounded-full border border-border px-4 py-3 text-sm font-medium text-primary hover:bg-surface"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/sign-up")}
                  className="w-full rounded-full bg-accent px-4 py-3 text-sm font-medium text-background"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={() => signOut(() => navigate("/"))}
                className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-error hover:bg-surface"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
