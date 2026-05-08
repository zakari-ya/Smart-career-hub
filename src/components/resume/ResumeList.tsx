import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ResumeCard } from "./ResumeCard";
import { FileQuestion } from "lucide-react";
import { Resume } from "../../types";

export function ResumeList() {
  const resumes = useQuery(api.resumes.getMyResumes);

  if (resumes === undefined || resumes === null) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[200px] w-full rounded-card bg-surface/50 animate-pulse border border-border/20" />
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 rounded-card border-2 border-dashed border-border/40 text-center bg-surface/30">
        <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-background border border-border/50 text-muted mb-6">
          <FileQuestion className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-medium text-primary mb-2">No resumes found</h3>
        <p className="text-sm text-secondary max-w-sm mb-8">
          Upload your first resume to start using the AI career intelligence platform.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume) => (
        <ResumeCard key={resume._id} resume={resume as Resume} />
      ))}
    </div>
  );
}
