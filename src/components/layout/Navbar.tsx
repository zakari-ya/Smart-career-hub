import { UserButton, SignedIn, SignedOut } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { useUiStore } from "@/stores/uiStore"
import { Link } from "react-router-dom"
import { BriefcaseBusiness, Menu } from "lucide-react"

export function Navbar() {
  const isOffline = useUiStore((state) => state.isOfflineMode);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
            <span className="font-bold">CareerHub</span>
          </Link>
          {isOffline && (
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-sm border border-destructive/20">
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <SignedIn>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/dashboard" className="text-foreground/60 hover:text-foreground">Dashboard</Link>
              <Link to="/resume" className="text-foreground/60 hover:text-foreground">Resume</Link>
              <Link to="/portfolio" className="text-foreground/60 hover:text-foreground">Portfolio</Link>
              <Link to="/jobs" className="text-foreground/60 hover:text-foreground">Jobs</Link>
            </nav>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </SignedOut>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
