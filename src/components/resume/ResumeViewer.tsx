
import { Resume } from "../../types";
import { Card } from "../ui/card";


interface ResumeViewerProps {
  resume: Resume;
}

export function ResumeViewer({ resume }: ResumeViewerProps) {
  // Assuming a getResumeUrl query exists or will be created
  // const fileUrl = useQuery(api.resumes.getResumeUrl, { storageId: resume.fileStorageId });
  
  if (!resume.fileStorageId) {
    return (
      <Card className="flex h-[500px] items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">No file attached to this resume.</p>
      </Card>
    );
  }

  // Placeholder for when we add getResumeUrl
  return (
    <Card className="flex h-[600px] flex-col overflow-hidden bg-muted/10">
      <div className="border-b bg-muted/30 px-4 py-2 text-sm font-medium">
        Preview: {resume.title}
      </div>
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-muted-foreground">
          Document viewer placeholder. File size: {(resume.fileSize / 1024).toFixed(1)} KB.
        </p>
        {/*
        {fileUrl ? (
          <iframe 
            src={fileUrl} 
            className="h-full w-full border-0 rounded-md bg-white" 
            title={resume.title}
          />
        ) : (
          <Skeleton className="h-full w-full rounded-md" />
        )}
        */}
      </div>
    </Card>
  );
}
