import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches synchronous errors thrown by Convex useQuery when the server
 * returns an error (e.g. Unauthorized) — prevents the entire tree from
 * unmounting and showing a black screen.
 *
 * Per AGENTS.md: Convex queries correctly throw on auth failure (RULE-S4).
 * This boundary surfaces those failures gracefully in the UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    // Log for monitoring (Sentry would hook here in production)
    // Per AGENTS.md §12: log security-relevant events server-side
    // We only log client-side for dev visibility — no raw error to UI
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary] Caught error:", error.message);
      console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
    }
    this.props.onError?.(error, errorInfo);
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAuthError =
        this.state.error?.message.toLowerCase().includes("unauthorized") ||
        this.state.error?.message.toLowerCase().includes("forbidden");

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/20 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold tracking-tight">
              {isAuthError ? "Authentication Required" : "Something went wrong"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {isAuthError
                ? "Your session could not be verified. Please sign in again."
                : "An unexpected error occurred. Try refreshing the page."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleReset}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
