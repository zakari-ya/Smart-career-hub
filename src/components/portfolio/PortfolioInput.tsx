import { useState } from "react";
import { Github, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Github className="mr-2 h-6 w-6" />
          Audit GitHub Portfolio
        </CardTitle>
        <CardDescription>
          Enter your GitHub username or portfolio URL to get an AI-powered review of your projects, READMEs, and code organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-muted-foreground sm:text-sm">github.com/</span>
            </div>
            <Input
              type="text"
              placeholder="username"
              className="pl-24"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={!url.trim() || isLoading}>
            {isLoading ? "Auditing..." : "Audit"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
