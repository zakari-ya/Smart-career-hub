import { Link } from "react-router-dom";
import { Briefcase, Menu, X } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from "../ui/button";
import { AvatarDropdown } from "../ui/AvatarDropdown";
import { NavDropdown } from "../ui/NavDropdown";
import { useState } from "react";

export function TopNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-border flex items-center px-6 lg:px-12">
      <div className="flex-1 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 flex items-center justify-center rounded-sm bg-accent/5 border border-accent/10 text-accent group-hover:scale-105 transition-transform">
            <Briefcase className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-primary tracking-tight">
            Smart Career
          </span>
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="/#pricing" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
            Pricing
          </a>
          <NavDropdown 
            label="Solutions" 
            items={["Resume Scanner", "Portfolio Auditor", "Job Matcher"]} 
          />
          <NavDropdown 
            label="Resources" 
            items={["Blog", "Documentation", "Guides"]} 
          />
          <NavDropdown 
            label="Company" 
            items={["About Us", "Careers", "Contact"]} 
          />
        </nav>

        {/* Right: Auth / Avatar */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <AvatarDropdown />
          </SignedIn>
          <SignedOut>
            <Button asChild variant="default" size="sm" className="h-9 px-5">
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>

          {/* Mobile Hamburger */}
          <button 
            className="lg:hidden p-2 text-secondary hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-border p-6 flex flex-col gap-6 animate-fade-in shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col gap-4">
            <a href="/#pricing" className="text-lg font-semibold tracking-tight text-secondary">Pricing</a>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Solutions</span>
              <div className="flex flex-col gap-3 pl-2">
                <Link to="/resume-scanner" className="text-sm font-medium text-secondary">Resume Scanner</Link>
                <Link to="/portfolio-auditor" className="text-sm font-medium text-secondary">Portfolio Auditor</Link>
                <Link to="/job-matcher" className="text-sm font-medium text-secondary">Job Matcher</Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Resources</span>
              <div className="flex flex-col gap-3 pl-2">
                <span className="text-sm font-medium text-secondary">Blog</span>
                <span className="text-sm font-medium text-secondary">Documentation</span>
                <span className="text-sm font-medium text-secondary">Guides</span>
              </div>
            </div>
          </nav>
          
          <div className="pt-6 border-t border-border/30">
            <SignedOut>
              <Button asChild className="w-full">
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
