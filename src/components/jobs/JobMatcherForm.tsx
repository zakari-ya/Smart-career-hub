import { useState } from "react";
import { Briefcase } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface JobMatcherFormProps {
  onSubmit: (resumeId: string, jobDescription: string) => void;
  isLoading?: boolean;
}

export function JobMatcherForm({ onSubmit, isLoading }: JobMatcherFormProps) {
  const resumes = useQuery(api.resumes.getMyResumes);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResume && jobDescription.trim()) {
      onSubmit(selectedResume, jobDescription.trim());
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-display flex items-center text-[20px] font-medium tracking-tight">
          <Briefcase className="mr-3 h-5 w-5 text-muted-foreground" />
          Job Matcher
        </CardTitle>
        <CardDescription>
          Paste a job description and select your resume to see how well you match and get tailored advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select Resume
            </label>
              <select
              className="flex h-10 w-full items-center justify-between rounded-[2px] border border-white/10 bg-white/[0.02] px-3 py-2 text-[14px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              disabled={isLoading || !resumes}
              required
            >
              <option value="" disabled>Select a resume...</option>
              {resumes?.map((resume) => (
                <option key={resume._id} value={resume._id}>
                  {resume.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Job Description
            </label>
            <textarea
              className="flex min-h-[160px] w-full rounded-[2px] border border-white/10 bg-white/[0.02] px-4 py-3 text-[14px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!selectedResume || !jobDescription.trim() || isLoading}
          >
            {isLoading ? "Matching..." : "Match with Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
