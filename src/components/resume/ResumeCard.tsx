import { FileText, Trash2, ChevronRight } from "lucide-react";
import { Resume } from "../../types";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024).toFixed(0) + " KB";
  };

  const handleDelete = async () => {
    toast.info("Delete functionality coming soon");
  };

  return (
    <div className="group relative flex flex-col gap-6 p-6 rounded-card bg-surface border border-border/30 transition-all hover:border-accent hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-background border border-border/50 text-accent">
          <FileText className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <button 
          onClick={handleDelete}
          className="p-2 text-muted hover:text-error transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-primary tracking-tight truncate">
          {resume.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
          <span>{resume.fileType}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{formatSize(resume.fileSize)}</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>{formatDate(resume.createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border/20">
        <Link
          to="/resume-scanner"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:gap-3 transition-all"
        >
          View Analysis <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
