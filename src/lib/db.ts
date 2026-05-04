import Dexie, { type EntityTable } from 'dexie';

// Define the interface for our offline resume uploads
export interface OfflineUpload {
  id?: number; // Auto-incrementing primary key
  fileData: Blob;
  fileName: string;
  fileType: "pdf" | "txt" | "md";
  fileSize: number;
  status: "pending" | "syncing" | "failed";
  createdAt: number;
}

// Create the database instance
const db = new Dexie('SmartCareerHubDB') as Dexie & {
  offlineUploads: EntityTable<
    OfflineUpload,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration
db.version(1).stores({
  offlineUploads: '++id, status, createdAt' // Primary key and indexed props
});

export { db };
