import { Link } from "react-router-dom";
import { 
  FileText, 
  Github, 
  Briefcase, 
  ShieldCheck,
  ArrowRight,
  ChevronRight
} from "lucide-react";

export function Landing() {
  return (
    <div className="flex flex-col gap-32 pb-32 animate-fade-in">
      {/* Hero */}
      <section className="flex flex-col items-center text-center pt-20">
        <div className="mb-16 group relative">
          <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <img 
            src="/mascot.png" 
            alt="Mascot" 
            className="relative h-64 w-64 md:h-80 md:w-80 object-contain filter grayscale opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col items-center gap-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/50">
            <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              AI Career Intelligence
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-primary leading-[1.1]">
            Build a career that <br /> matches your potential.
          </h1>

          <p className="text-xl text-secondary max-w-2xl leading-relaxed font-medium">
            Smart tools to audit your resume, projects, and job matches. <br />
            Minimalist, private, and powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Link
              to="/resume-scanner"
              className="flex items-center justify-center gap-2 h-14 px-12 rounded-full bg-accent text-white font-semibold text-lg transition-all hover:bg-accent/90 active:scale-[0.98]"
            >
              Start Building
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/resume-scanner?guest=true"
              className="flex items-center justify-center h-14 px-12 rounded-full border border-border bg-white text-primary font-semibold text-lg transition-all hover:bg-surface active:scale-[0.98]"
            >
              Try Guest Mode
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          {
            title: "Resume Scanner",
            desc: "Instant ATS scores and actionable editorial feedback.",
            icon: FileText,
            link: "/resume-scanner"
          },
          {
            title: "Portfolio Auditor",
            desc: "AI-powered review of your GitHub repositories.",
            icon: Github,
            link: "/portfolio-auditor"
          },
          {
            title: "Job Matcher",
            desc: "Find gaps between your profile and job descriptions.",
            icon: Briefcase,
            link: "/job-matcher"
          }
        ].map((feature) => (
          <Link 
            key={feature.title}
            to={feature.link}
            className="group flex flex-col gap-6 p-8 rounded-card border border-border/30 bg-surface transition-all hover:border-accent hover:-translate-y-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-background border border-border/50 text-accent">
              <feature.icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold text-primary">{feature.title}</h3>
              <p className="text-sm text-secondary leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent group-hover:gap-3 transition-all">
              Explore <ChevronRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </section>

      {/* Trust Section */}
      <section className="flex flex-col md:flex-row items-center gap-20 p-12 md:p-20 rounded-card bg-surface border border-border/30">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Security First
            </div>
            <h2 className="text-4xl font-semibold text-primary tracking-tight">
              Private by design.
            </h2>
          </div>
          
          <ul className="flex flex-col gap-4">
            {[
              "End-to-end encryption for all documents",
              "Local processing options for privacy",
              "No permanent storage without consent"
            ].map((text) => (
              <li key={text} className="flex items-center gap-4 text-secondary font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {text}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Compliant with global privacy standards
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="h-64 w-64 text-accent/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-12 pt-12 border-t border-border/30">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-accent">
              Smart Career Hub
            </span>
            <span className="text-xs font-medium text-muted">
              Built for the next generation of talent.
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted">Platform</h4>
              <nav className="flex flex-col gap-2">
                <Link to="/resume-scanner" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Scanner</Link>
                <Link to="/portfolio-auditor" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Auditor</Link>
                <Link to="/job-matcher" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Matcher</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted">Resources</h4>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Documentation</a>
                <a href="#" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Blog</a>
                <a href="#" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Changelog</a>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted">Legal</h4>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Privacy</a>
                <a href="#" className="text-xs font-semibold text-secondary hover:text-accent transition-colors">Terms</a>
              </nav>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted">
          <span>© 2026 Smart Career Hub</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-accent transition-colors">GitHub</a>
            <a href="#" className="hover:text-accent transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
