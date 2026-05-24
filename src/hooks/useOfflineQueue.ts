import { useState, useEffect } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { db } from '../lib/db';
import { toast } from "sonner";
import { useLiveQuery } from 'dexie-react-hooks';
import {
  MAX_RESUME_FILE_SIZE_BYTES,
  isAllowedResumeFileType,
  type ResumeFileType,
} from "../../shared/uploadPolicy";

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Convex mutations for syncing
  const generateUploadUrl = useMutation(api.resumes.generateUploadUrl);
  const createResume = useMutation(api.resumes.createResume);

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue(); // Trigger sync when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use Dexie's live query to reactively fetch pending uploads
  const pendingUploads = useLiveQuery(
    () => db.offlineUploads.where('status').equals('pending').toArray()
  ) || [];

  // Add a new file to the offline queue
  const addToQueue = async (file: File) => {
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !isAllowedResumeFileType(extension)) {
        throw new Error("Unsupported file type.");
      }

      if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
        throw new Error("File size exceeds the 5MB limit.");
      }

      const fileType = extension as ResumeFileType;

      await db.offlineUploads.add({
        fileData: file,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        status: 'pending',
        createdAt: Date.now()
      });

      if (!isOnline) {
        toast.info("You're offline. Resume queued for upload.");
      } else {
        // Try to sync immediately if we are online
        syncQueue();
      }
    } catch (error) {
      console.error("Failed to add to offline queue:", error);
      toast.error("Failed to queue file for upload.");
    }
  };

  // Sync the queue with the backend
  const syncQueue = async () => {
    if (!navigator.onLine || isSyncing) return;

    try {
      setIsSyncing(true);
      const pendingItems = await db.offlineUploads.where('status').equals('pending').toArray();

      for (const item of pendingItems) {
        if (!item.id) continue;

        // Mark as syncing
        await db.offlineUploads.update(item.id, { status: 'syncing' });

        try {
          // 1. Generate upload URL
          const postUrl = await generateUploadUrl();
          
          // 2. Upload file to storage
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": item.fileData.type || "application/octet-stream" },
            body: item.fileData,
          });
          const { storageId } = await result.json();

          // 3. Create resume record in Convex
          await createResume({
            title: item.fileName,
            fileStorageId: storageId,
            fileType: item.fileType,
            fileSize: item.fileSize,
          });

          // 4. On success, remove from offline queue
          await db.offlineUploads.delete(item.id);
          toast.success(`Successfully synced: ${item.fileName}`);
          
        } catch (itemError) {
          console.error(`Failed to sync ${item.fileName}:`, itemError);
          // Revert status to pending so it can be retried later
          await db.offlineUploads.update(item.id, { status: 'pending' });
        }
      }
    } catch (error) {
      console.error("Error during queue sync:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Optional background sync registration
  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        // We typecast as any because SyncManager types might not be in standard DOM libs
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (registration as any).sync.register('sync-resumes');
        } catch (e) {
          console.log("Background sync could not be registered:", e);
        }
      });
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingUploads,
    addToQueue,
    syncQueue
  };
}
