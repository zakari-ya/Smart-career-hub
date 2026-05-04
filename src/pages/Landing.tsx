import { FileText, Github, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export function Landing() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Elevate Your Career with <br />
              <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                AI Intelligence
              </span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Smart Career Hub is an editorial-grade suite of AI tools to refine your resume,
              audit your GitHub portfolio, and match you with the perfect job. 
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="h-12 px-8 text-base">
                <Link to="/dashboard">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <Link to="/resume-scanner">Try Guest Mode</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:border-primary/50">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <FileText className="h-12 w-12 text-primary/80" />
                <div className="space-y-2">
                  <h3 className="font-bold">Resume Scanner</h3>
                  <p className="text-sm text-muted-foreground">
                    Get an instant ATS score and actionable feedback to improve your resume impact.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:border-primary/50">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Github className="h-12 w-12 text-primary/80" />
                <div className="space-y-2">
                  <h3 className="font-bold">Portfolio Auditor</h3>
                  <p className="text-sm text-muted-foreground">
                    AI reviews your GitHub projects and writes better, more professional READMEs.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:border-primary/50">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Briefcase className="h-12 w-12 text-primary/80" />
                <div className="space-y-2">
                  <h3 className="font-bold">Job Matcher</h3>
                  <p className="text-sm text-muted-foreground">
                    Compare your resume against any job description to find missing keywords and gaps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
