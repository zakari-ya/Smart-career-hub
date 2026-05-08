import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

interface PortfolioInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

export function PortfolioInput({ onSubmit, isLoading }: PortfolioInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <div className="absolute left-6 text-muted font-mono text-sm pointer-events-none select-none">
          github.com/
        </div>
        <input
          type="text"
          placeholder="username"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="w-full h-16 pl-32 pr-40 bg-surface border-2 border-border/50 rounded-full text-lg font-medium text-primary placeholder:text-muted/50 focus:outline-none focus:border-accent transition-all group-hover:border-border"
        />
        <div className="absolute right-2">
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="flex items-center gap-2 h-12 px-8 rounded-full bg-accent text-white font-medium text-sm transition-all hover:bg-accent/90 disabled:opacity-30 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Auditing
              </>
            ) : (
              <>
                Audit
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted font-normal">
        Works with usernames or repository URLs. Private data is never stored.
      </p>
    </form>
  );
}
