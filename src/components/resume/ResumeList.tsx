import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ResumeCard } from "./ResumeCard";
import { Skeleton } from "../ui/skeleton";
import { FileQuestion } from "lucide-react";
import { Resume } from "../../types";

export function ResumeList() {
  const resumes = useQuery(api.resumes.getMyResumes);

  // undefined = Convex still loading; null = not authenticated yet
  if (resumes === undefined || resumes === null) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold tracking-tight">No resumes found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You haven't uploaded any resumes yet. Upload your first resume above to get started with the AI analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume) => (
        <ResumeCard key={resume._id} resume={resume as Resume} />
      ))}
    </div>
  );
}
