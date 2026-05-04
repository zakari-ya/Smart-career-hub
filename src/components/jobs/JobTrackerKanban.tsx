import { useState } from "react";

import { JobCard } from "./JobCard";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

const COLUMNS = [
  { id: "wishlist", title: "Wishlist" },
  { id: "applied", title: "Applied" },
  { id: "phone_screen", title: "Phone Screen" },
  { id: "interview", title: "Interview" },
  { id: "offer", title: "Offer" },
  { id: "rejected", title: "Rejected" },
  { id: "accepted", title: "Accepted" }
] as const;

export function JobTrackerKanban() {
  // Assume we have getMyJobs query in convex/jobs.ts
  // const jobs = useQuery(api.jobs.getMyJobs) || [];
  const jobs: import("../../types").JobTracker[] = []; // Placeholder until backend is implemented
  
  const [boardJobs] = useState(jobs);

  // Group jobs by status
  const jobsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = boardJobs.filter(job => job.status === col.id);
    return acc;
  }, {} as Record<string, import("../../types").JobTracker[]>);

  return (
    <div className="flex h-[600px] w-full overflow-x-auto pb-4 gap-6">
      {COLUMNS.map((col) => (
        <div key={col.id} className="flex min-w-[300px] flex-col rounded-[4px] bg-white/[0.02] border border-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-[12px] font-semibold tracking-widest uppercase text-muted-foreground/80 flex items-center">
              {col.title}
              <span className="ml-3 rounded-[2px] bg-white/5 px-2 py-0.5 text-[10px]">
                {jobsByStatus[col.id]?.length || 0}
              </span>
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {jobsByStatus[col.id]?.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
            
            {(!jobsByStatus[col.id] || jobsByStatus[col.id]?.length === 0) && (
              <div className="flex h-24 items-center justify-center rounded-[2px] border border-dashed border-white/10 bg-transparent">
                <span className="font-display text-[12px] font-medium tracking-wide text-muted-foreground/50">No jobs</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
