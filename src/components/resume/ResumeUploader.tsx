import { useState, useCallback } from "react";
import { 
  UploadCloud, 
  FileText, 
  FileCode, 
  FileType, 
  AlertCircle,
  FileBox
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { useOfflineQueue } from "../../hooks/useOfflineQueue";

export function ResumeUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { isOnline, isSyncing, addToQueue, pendingUploads } = useOfflineQueue();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileType className="h-6 w-6 text-red-400" />;
      case 'docx': return <FileBox className="h-6 w-6 text-blue-400" />;
      case 'md': return <FileCode className="h-6 w-6 text-emerald-400" />;
      default: return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  const validateFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > 10 * 1024 * 1024) {
      const msg = "File size exceeds 10MB limit";
      toast.error(msg);
      setError(msg);
      return false;
    }
    
    const validTypes = [
      "application/pdf", 
      "text/plain", 
      "text/markdown", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const extension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'txt', 'md', 'docx'];
    
    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(extension || "")) {
      const msg = "Unsupported file type. Use PDF, DOCX, TXT, or MD.";
      toast.error(msg);
      setError(msg);
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
    <div className="space-y-4">
      {!isOnline && (
        <div className="flex items-center gap-3 rounded-[2px] bg-amber-500/10 p-4 border border-amber-500/20 text-amber-500/90 text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          You are currently offline. Uploads will be synced when you reconnect.
        </div>
      )}

      {pendingUploads.length > 0 && (
        <div className="flex items-center gap-3 rounded-[2px] bg-sky-500/10 p-4 border border-sky-500/20 text-sky-500/90 text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <UploadCloud className="h-4 w-4 animate-bounce" />
          {pendingUploads.length} resume(s) waiting to upload... {isSyncing ? "(Syncing now)" : ""}
        </div>
      )}

      <Card className="w-full border-white/5 bg-white/[0.01] overflow-hidden">
        <CardContent className="p-6">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-[2px] border-2 border-dashed p-10 text-center transition-all duration-500",
              isDragging
                ? "border-primary/50 bg-primary/10 scale-[0.99]"
                : "border-white/5 hover:border-white/10 hover:bg-white/[0.02]",
              file && "border-primary/30 bg-primary/5",
              error && "border-destructive/30 bg-destructive/5"
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <input
              type="file"
              accept=".pdf,.txt,.md,.docx"
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              onChange={onFileChange}
              disabled={isSyncing}
            />
            
            {file ? (
              <div className="flex flex-col items-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="flex h-14 w-14 items-center justify-center rounded-[2px] bg-primary/10 border border-primary/20 text-primary mb-2 shadow-lg shadow-primary/10">
                  {getFileIcon(file.name)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[2px] bg-white/5 border border-white/10 mb-2 transition-transform duration-300 group-hover:scale-110">
                  <UploadCloud className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground/90">
                    {isDragging ? "Drop it here!" : "Click or drag resume to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    PDF, DOCX, TXT or MD up to 10MB
                  </p>
                </div>
              </div>
            )}

            {!file && (
              <div className="mt-6 flex flex-wrap justify-center gap-1.5 opacity-60">
                {['PDF', 'DOCX', 'TXT', 'MD'].map((ext) => (
                  <span key={ext} className="inline-flex items-center rounded-[2px] bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-tighter text-muted-foreground border border-white/5">
                    {ext}
                  </span>
                ))}
              </div>
            )}
          </div>

          {file && (
            <div className="mt-5 flex justify-end space-x-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
                disabled={isSyncing}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
              <Button size="sm" onClick={handleUpload} disabled={isSyncing} className="shadow-md shadow-primary/20">
                {isOnline ? "Upload Now" : "Queue for Sync"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
