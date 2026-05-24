import { useState, useCallback } from "react";
import { 
  UploadCloud, 
  FileText, 
  AlertCircle,
  Plus,
  ArrowRight
} from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useOfflineQueue } from "../../hooks/useOfflineQueue";
import {
  ALLOWED_RESUME_FILE_TYPES,
  MAX_RESUME_FILE_SIZE_BYTES,
  isAllowedResumeFileType,
} from "../../../shared/uploadPolicy";

export function ResumeUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const { isOnline, isSyncing, addToQueue, pendingUploads } = useOfflineQueue();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_RESUME_FILE_SIZE_BYTES) {
      const msg = "File size exceeds the 5MB limit";
      toast.error(msg);
      return false;
    }
    
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !isAllowedResumeFileType(extension)) {
      const msg = `Unsupported file type. Use ${ALLOWED_RESUME_FILE_TYPES.map((type) => type.toUpperCase()).join(", ")}.`;
      toast.error(msg);
      return false;
    }
    return true;
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    await addToQueue(file);
    setFile(null);
    toast.success("Resume uploaded successfully!");
  };

  return (
    <div className="flex flex-col gap-6">
      {!isOnline && (
        <div className="flex items-center gap-3 rounded-md bg-amber-50 p-4 border border-amber-200 text-amber-700 text-xs font-medium animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          Offline mode. Uploads will sync later.
        </div>
      )}

      {pendingUploads.length > 0 && (
        <div className="flex items-center gap-3 rounded-md bg-accent/5 p-4 border border-accent/10 text-accent text-xs font-medium animate-pulse">
          <UploadCloud className="h-4 w-4" />
          {pendingUploads.length} uploads pending sync...
        </div>
      )}

      <div
        className={cn(
          "relative group flex flex-col items-center justify-center rounded-card border-2 border-dashed p-12 text-center transition-all duration-300",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-border/50 hover:border-accent hover:bg-surface/50",
          file && "border-accent bg-accent/5"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".pdf,.txt,.md"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          onChange={onFileChange}
          disabled={isSyncing}
        />
        
        {file ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-background border border-border/50 text-accent">
              <FileText className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-primary">{file.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <div className="flex items-center gap-4 mt-2 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs font-bold uppercase tracking-widest text-muted hover:text-error transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); void handleUpload(); }}
                className="flex items-center gap-2 h-10 px-6 rounded-full bg-accent text-white font-medium text-xs transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                {isOnline ? "Confirm Upload" : "Queue Sync"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-background border border-border/50 text-muted transition-colors group-hover:text-accent">
              <Plus className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-primary">
                {isDragging ? "Drop to upload" : "Select or drag resume"}
              </p>
              <p className="text-xs text-secondary font-normal">
                PDF, TXT, or MD up to 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
