import { FileText, Trash2, Activity } from "lucide-react";
import { Resume } from "../../types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useState } from "react";

import { toast } from "sonner";

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const [isDeleting] = useState(false);
  // Assuming we will have a deleteResume mutation in the future
  // const deleteResume = useMutation(api.resumes.deleteResume);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(timestamp));
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleDelete = async () => {
    // setIsDeleting(true);
    // try {
    //   await deleteResume({ id: resume._id });
    //   toast.success("Resume deleted");
    // } catch (e) {
    //   toast.error("Failed to delete resume");
    // } finally {
    //   setIsDeleting(false);
    // }
    toast.info("Delete functionality coming soon");
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between p-5">
        <div className="flex items-start space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 text-muted-foreground transition-colors group-hover:text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-[16px] font-medium tracking-tight text-foreground/90">
              {resume.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatSize(resume.fileSize)} • Uploaded {formatDate(resume.createdAt)}
            </p>
            <div className="pt-2">
              <Badge variant="secondary" className="uppercase text-[10px]">
                {resume.fileType}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Activity className="h-4 w-4" />
            <span className="sr-only">Analyze</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
