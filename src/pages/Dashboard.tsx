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
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

interface StatCardProps {
  id: string;
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  trend?: string;
}

function StatCard({ id, label, value, sub, icon: Icon, trend }: StatCardProps) {
  return (
    <div
      id={id}
      className="flex flex-col gap-4 rounded-card bg-surface p-6 transition-all hover:-translate-y-0.5 duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border/50">
          <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className="px-2 py-0.5 rounded-full bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-4xl font-semibold text-primary tracking-tight mb-1">
          {value}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </p>
      </div>
      <p className="text-xs text-secondary font-medium mt-2">{sub}</p>
    </div>
  );
}

export function Dashboard() {
  const resumes = useQuery(api.resumes.getMyResumes);
  const { user } = useUser();

  const resumeCount = resumes?.length ?? 0;

  return (
    <div className="space-y-16 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-10">
        <div>
          <h1 className="text-5xl font-semibold text-primary tracking-tight leading-tight">
            {user?.firstName ? `Hey, ${user.firstName}.` : "Dashboard"}
          </h1>
          <p className="mt-2 text-lg text-secondary font-normal">
            Your career intelligence at a glance.
          </p>
        </div>

        <Link
          to="/resume-scanner"
          id="dashboard-new-analysis"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-8 text-sm font-medium text-white transition-all hover:bg-accent/90 shadow-sm active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          New Analysis
        </Link>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          id="stat-resumes"
          label="Resumes"
          value={resumeCount}
          sub={resumeCount === 0 ? "Upload your first resume" : "Manage in Resume Scanner"}
          icon={FileText}
          trend="+12%"
        />
        <StatCard
          id="stat-applications"
          label="Applications"
          value={0}
          sub="Tracked across your board"
          icon={Briefcase}
        />
        <StatCard
          id="stat-avg-score"
          label="Match Score"
          value="—"
          sub="Based on recent matches"
          icon={Activity}
        />
      </div>

      {/* ── Main Content Area ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Resumes List */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-medium text-primary tracking-tight">
                Your Resumes
              </h2>
              <p className="text-sm text-secondary mt-1 font-normal">
                Ready for AI review and optimization
              </p>
            </div>
            <Link
              to="/resume-scanner"
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-accent transition-colors group"
            >
              View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="bg-surface/50 rounded-card p-2 border border-border/30">
            <ResumeList />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-primary tracking-tight">
              Activity
            </h2>
            <p className="text-sm text-secondary mt-1 font-normal">
              Latest insights and updates
            </p>
          </div>
          
          <div className="flex flex-col gap-6 rounded-card bg-surface/50 p-8 border border-border/30 text-center items-center justify-center min-h-[300px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border/50 mb-4">
              <Sparkles className="h-8 w-8 text-accent/20" strokeWidth={1} />
            </div>
            <div>
              <p className="text-lg font-medium text-primary">No activity yet</p>
              <p className="mt-2 text-sm text-secondary leading-relaxed font-normal max-w-[220px] mx-auto">
                Run your first analysis to see results and career insights here.
              </p>
            </div>
            <Link
              to="/resume-scanner"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-2.5 text-sm font-medium text-primary transition-all hover:bg-surface active:scale-[0.98]"
            >
              Start scanning
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────────── */}
      <div className="border-t border-border pt-16">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-8">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { href: "/resume-scanner",    label: "Scan Resume",      icon: FileText,  desc: "ATS feedback" },
            { href: "/portfolio-auditor", label: "Audit Portfolio",    icon: Activity,  desc: "GitHub analysis" },
            { href: "/job-matcher",       label: "Match Job",        icon: Briefcase, desc: "Compare to JD" },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group flex items-center gap-6 rounded-card border border-border/50 bg-background p-6 transition-all hover:border-accent hover:bg-surface active:scale-[0.99]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface border border-border/30">
                <item.icon className="h-6 w-6 text-muted transition-colors group-hover:text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-medium text-primary leading-tight">{item.label}</p>
                <p className="text-sm text-secondary mt-1 font-normal">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-border group-hover:text-accent transition-colors" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
