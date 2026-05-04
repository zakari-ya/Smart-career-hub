import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";

export function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show the prompt after 30 seconds as per AGENTS.md rules
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("Thanks for installing Smart Career Hub!");
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Could save this preference in localStorage to avoid bugging them again this session
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[300px] animate-slide-up">
      <Card className="border-primary/20 bg-background shadow-lg">
        <div className="flex flex-col p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm">Install App</h3>
            <button 
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Install Smart Career Hub for a faster, offline-capable experience.
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="w-full text-xs" onClick={handleInstallClick}>
              <Download className="mr-2 h-3 w-3" />
              Install
            </Button>
            <Button size="sm" variant="outline" className="w-full text-xs" onClick={handleDismiss}>
              Maybe Later
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
