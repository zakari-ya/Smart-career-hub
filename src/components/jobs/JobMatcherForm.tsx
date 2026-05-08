import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ResumeUploader } from "../resume/ResumeUploader";

interface JobMatcherFormProps {
  onSubmit: (resumeId: string, jobDescription: string) => void;
  isLoading?: boolean;
}

export function JobMatcherForm({ onSubmit, isLoading }: JobMatcherFormProps) {
  const resumes = useQuery(api.resumes.getMyResumes);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [showUploader, setShowUploader] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResume && jobDescription.trim()) {
      onSubmit(selectedResume, jobDescription.trim());
    }
  };

  if (showUploader) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <ResumeUploader />
        <button
          onClick={() => setShowUploader(false)}
          className="text-xs font-bold uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          ← Back to selection
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Select Resume
          </label>
          <button
            type="button"
            onClick={() => setShowUploader(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
          >
            + Upload New
          </button>
        </div>
        <select
          className="h-12 w-full rounded-md border border-border bg-background px-4 text-sm font-medium text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
          value={selectedResume}
          onChange={(e) => setSelectedResume(e.target.value)}
          disabled={isLoading || !resumes}
          required
        >
          <option value="" disabled>Choose from library...</option>
          {resumes?.map((resume) => (
            <option key={resume._id} value={resume._id}>
              {resume.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          Job Description
        </label>
        <textarea
          className="min-h-[240px] w-full rounded-md border border-border bg-background px-4 py-4 text-sm font-normal text-primary placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
          placeholder="Paste the full job posting text here to identify skill gaps..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={!selectedResume || !jobDescription.trim() || isLoading}
        className="flex items-center justify-center gap-2 h-12 w-full rounded-full bg-accent text-white font-medium text-sm transition-all hover:bg-accent/90 disabled:opacity-30 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing Match
          </>
        ) : (
          <>
            Run Match Analysis
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
