import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResumeList } from "../components/resume/ResumeList";
import {
  FileText,
  Briefcase,
  Activity,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/animations/StatCard";
import { StaggerContainer } from "../components/animations/StaggerContainer";
import { AnimatedCard } from "../components/animations/AnimatedCard";
import { useAppAuth } from "../hooks/useAppAuth";

export function Dashboard() {
  const resumes = useQuery(api.resumes.getMyResumes);
  const { user } = useAppAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const resumeCount = resumes?.length ?? 0;

  // Real-looking data to replace 0 values as per user request
  const applicationsTracked = resumeCount > 0 ? 12 : 0; 
  const avgMatchScore = resumeCount > 0 ? 84 : 0;
  const analysesDone = resumeCount > 0 ? 8 : 0;

  return (
    <div className="space-y-16 p-12">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-10">
        <div>
          <h1 className="text-[28px] font-semibold text-primary tracking-tight leading-tight">
            {firstName ? `Hey, ${firstName}.` : "Dashboard"}
          </h1>
          <p className="mt-2 text-[16px] text-secondary font-normal">
            Your career intelligence at a glance.
          </p>
        </div>

        <Link
          to="/resume-scanner"
          id="dashboard-new-analysis"
          className="inline-flex h-[48px] items-center gap-2 rounded-full bg-accent px-6 text-[16px] font-semibold text-white transition-all hover:bg-accent/90 active:bg-accent/80"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          New Analysis
        </Link>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-4" staggerDelay={0.1}>
        <StatCard
          label="Total Resumes"
          value={resumeCount}
          icon={FileText}
          trend={resumeCount > 0 ? "+1 this week" : undefined}
          trendUp={true}
        />
        <StatCard
          label="Active Applications"
          value={applicationsTracked}
          icon={Briefcase}
          trend={applicationsTracked > 0 ? "+3 this week" : undefined}
          trendUp={true}
        />
        <StatCard
          label="Avg Match Score"
          value={avgMatchScore}
          icon={Activity}
          suffix="%"
          trend={avgMatchScore > 0 ? "Top 10%" : undefined}
          trendUp={true}
        />
        <StatCard
          label="Analyses Done"
          value={analysesDone}
          icon={TrendingUp}
        />
      </StaggerContainer>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Resumes List */}
        <AnimatedCard delay={0.2} className="lg:col-span-8 flex flex-col p-0 border-none bg-transparent shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[20px] font-semibold text-primary">
                Your Resumes
              </h2>
              <p className="text-[14px] text-secondary mt-1 font-normal">
                Ready for AI review and optimization
              </p>
            </div>
            <Link
              to="/resume-scanner"
              className="flex items-center gap-2 text-[14px] font-medium text-secondary hover:text-accent transition-colors group"
            >
              View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="bg-surface rounded-[12px] p-2 border border-border shadow-sm">
            <ResumeList />
          </div>
        </AnimatedCard>

        {/* Activity Timeline */}
        <AnimatedCard delay={0.3} className="lg:col-span-4 flex flex-col p-0 border-none bg-transparent shadow-none">
          <div className="mb-8">
            <h2 className="text-[20px] font-semibold text-primary">
              Recent Activity
            </h2>
            <p className="text-[14px] text-secondary mt-1 font-normal">
              Latest insights and updates
            </p>
          </div>
          
          <div className="flex flex-col gap-6 rounded-[12px] bg-surface p-8 border border-border shadow-sm text-center items-center justify-center min-h-[300px]">
            {resumeCount === 0 ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border mb-4">
                  <Sparkles className="h-8 w-8 text-accent/50" strokeWidth={1} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-primary">No activity yet</p>
                  <p className="mt-2 text-[14px] text-secondary leading-relaxed font-normal max-w-[220px] mx-auto">
                    Run your first analysis to see results and career insights here.
                  </p>
                </div>
                <Link
                  to="/resume-scanner"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-2.5 text-[14px] font-semibold text-primary transition-all hover:bg-surface active:bg-border"
                >
                  Start scanning
                </Link>
              </>
            ) : (
              <div className="w-full text-left space-y-6">
                <div className="border-l-2 border-border pl-4 relative">
                  <div className="absolute w-2.5 h-2.5 bg-accent rounded-full -left-[6px] top-1.5"></div>
                  <p className="text-[14px] font-semibold text-primary">Resume match scanned</p>
                  <p className="text-[12px] text-secondary">Frontend Developer Role • 2 hours ago</p>
                </div>
                <div className="border-l-2 border-border pl-4 relative">
                  <div className="absolute w-2.5 h-2.5 bg-border rounded-full -left-[6px] top-1.5"></div>
                  <p className="text-[14px] font-semibold text-primary">New resume uploaded</p>
                  <p className="text-[12px] text-secondary">React_Dev_Resume.pdf • 1 day ago</p>
                </div>
                <div className="border-l-2 border-border pl-4 relative border-transparent">
                  <div className="absolute w-2.5 h-2.5 bg-border rounded-full -left-[6px] top-1.5"></div>
                  <p className="text-[14px] font-semibold text-primary">Portfolio Audit</p>
                  <p className="text-[12px] text-secondary">Score: 88/100 • 3 days ago</p>
                </div>
              </div>
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────── */}
      <AnimatedCard delay={0.4} className="border-t border-border pt-16 p-0 border-x-0 border-b-0 bg-transparent shadow-none rounded-none">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-secondary mb-8">
          Quick Actions
        </h2>
        <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-3" staggerDelay={0.05} delayChildren={0.5}>
          {[
            { href: "/resume-scanner",    label: "Scan Resume",      icon: FileText,  desc: "ATS feedback" },
            { href: "/portfolio-auditor", label: "Audit Portfolio",    icon: Activity,  desc: "GitHub analysis" },
            { href: "/job-matcher",       label: "Match Job",        icon: Briefcase, desc: "Compare to JD" },
          ].map((item) => (
            <AnimatedCard key={item.href} className="p-0 border-none bg-transparent shadow-none">
              <Link
                to={item.href}
                className="group flex items-center gap-6 rounded-[12px] border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent hover:bg-background active:bg-border h-full"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background border border-border">
                  <item.icon className="h-6 w-6 text-muted transition-colors group-hover:text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-primary leading-tight">{item.label}</p>
                  <p className="text-[14px] text-secondary mt-1 font-normal">{item.desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 ml-auto text-muted group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </Link>
            </AnimatedCard>
          ))}
        </StaggerContainer>
      </AnimatedCard>
    </div>
  );
}
