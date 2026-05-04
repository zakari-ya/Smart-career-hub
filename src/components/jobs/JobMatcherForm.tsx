import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
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

  return (
    <Card className="w-full border-white/5 bg-white/[0.01]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display flex items-center text-[20px] font-medium tracking-tight">
            <Briefcase className="mr-3 h-5 w-5 text-muted-foreground" />
            Job Matcher
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowUploader(!showUploader)}
            className="text-[11px] h-7 px-2 uppercase tracking-wider font-bold"
          >
            {showUploader ? "Select Existing" : "Upload New"}
          </Button>
        </div>
        <CardDescription>
          {showUploader 
            ? "Upload a new resume to compare against this job." 
            : "Select a resume and paste the job description to see your match."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showUploader ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <ResumeUploader />
            <p className="mt-4 text-[11px] text-center text-muted-foreground italic">
              After uploading, it will appear in the dropdown.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select Resume
              </label>
              <select
                className="flex h-11 w-full items-center justify-between rounded-[2px] border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-foreground shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                disabled={isLoading || !resumes}
                required
              >
                <option value="" disabled>Choose from your library...</option>
                {resumes?.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title} ({resume.fileType.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Job Description
              </label>
              <textarea
                className="flex min-h-[200px] w-full rounded-[2px] border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-foreground shadow-sm transition-all placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed"
                placeholder="Paste the full job posting text here to identify skill gaps..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-sm font-bold shadow-lg shadow-primary/10" 
              disabled={!selectedResume || !jobDescription.trim() || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Calculating Match...
                </span>
              ) : "Analyze Match Probability"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
