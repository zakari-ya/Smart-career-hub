import { useState, useCallback } from "react";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useOfflineQueue } from "../../hooks/useOfflineQueue";

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
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return false;
    }
    const validTypes = ["application/pdf", "text/plain", "text/markdown"];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.md')) {
      toast.error("Only PDF, TXT, and MD files are allowed");
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

    // Use our new offline queue hook instead of direct upload
    await addToQueue(file);
    setFile(null);
  };

  return (
    <div className="space-y-4">
      {!isOnline && (
        <div className="flex items-center gap-3 rounded-[2px] bg-amber-500/10 p-4 border border-amber-500/20 text-amber-500/90 text-[13px] font-medium">
          You are currently offline. Uploads will be queued and synced when you reconnect.
        </div>
      )}

      {pendingUploads.length > 0 && (
        <div className="flex items-center gap-3 rounded-[2px] bg-sky-500/10 p-4 border border-sky-500/20 text-sky-500/90 text-[13px] font-medium">
          {pendingUploads.length} resume(s) waiting to upload... {isSyncing ? "(Syncing now)" : ""}
        </div>
      )}

      <Card className="w-full">
        <CardContent className="p-6">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-[2px] border border-dashed p-14 text-center transition-all duration-300",
              isDragging
                ? "border-primary/50 bg-primary/5"
                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
              file && "border-primary/30 bg-primary/5"
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
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-primary/10 border border-primary/20 text-primary mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 mb-2">
                  <UploadCloud className="h-6 w-6 text-muted-foreground/70" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Click or drag file to this area to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Support for a single or bulk upload. PDF, TXT or MD up to 5MB.
                  </p>
                </div>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setFile(null)}
                disabled={isSyncing}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isSyncing}>
                {isOnline ? "Upload Resume" : "Queue Upload"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
