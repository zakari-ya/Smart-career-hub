import { Building2, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { JobStatusBadge } from "./JobStatusBadge";

interface JobCardProps {
  job: import("../../types").JobTracker; // Using imported type<"jobTrackers"> based on the schema
  onClick?: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(timestamp));
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <h3 className="font-display text-[16px] font-medium tracking-tight text-foreground/90 line-clamp-1" title={job.role}>
            {job.role}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm mt-1">
            <Building2 className="mr-1 h-3.5 w-3.5" />
            <span className="line-clamp-1">{job.company}</span>
          </div>
        </div>
        <JobStatusBadge status={job.status} />
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-3">
          {job.salaryRange && (
            <div className="flex items-center">
              <DollarSign className="mr-1 h-3.5 w-3.5" />
              {job.salaryRange}
            </div>
          )}
          {job.appliedAt && (
            <div className="flex items-center">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              Applied {formatDate(job.appliedAt)}
            </div>
          )}
        </div>
        
        {job.jobUrl && (
          <div className="mt-3 flex">
            <a 
              href={job.jobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              View Posting
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
