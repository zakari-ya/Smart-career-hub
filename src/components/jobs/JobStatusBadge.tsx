import { Badge } from "../ui/badge";

type JobStatus = "wishlist" | "applied" | "phone_screen" | "interview" | "offer" | "rejected" | "accepted";

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const statusConfig: Record<JobStatus, { label: string; className: string }> = {
    wishlist: { label: "Wishlist", className: "bg-slate-500 hover:bg-slate-600" },
    applied: { label: "Applied", className: "bg-blue-500 hover:bg-blue-600" },
    phone_screen: { label: "Phone Screen", className: "bg-purple-500 hover:bg-purple-600" },
    interview: { label: "Interview", className: "bg-orange-500 hover:bg-orange-600" },
    offer: { label: "Offer", className: "bg-green-500 hover:bg-green-600" },
    rejected: { label: "Rejected", className: "bg-red-500 hover:bg-red-600" },
    accepted: { label: "Accepted", className: "bg-emerald-600 hover:bg-emerald-700" },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`text-white shadow-none ${config.className}`}>
      {config.label}
    </Badge>
  );
}
