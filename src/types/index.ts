import { Id } from "../../convex/_generated/dataModel";

export interface Resume {
  _id: Id<"resumes">;
  userId: Id<"users">;
  authUserId: string;
  title: string;
  fileStorageId?: Id<"_storage">;
  extractedText?: string;
  fileType: "pdf" | "txt" | "md";
  fileSize: number;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Analysis {
  _id: Id<"analyses">;
  userId: Id<"users">;
  authUserId: string;
  resumeId?: Id<"resumes">;
  portfolioUrl?: string;
  jobDescription?: string;
  type: "resume_review" | "job_match" | "portfolio_audit";
  aiModel: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    missingSkills?: string[];
    improvedDescriptions?: string[];
  };
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
}

export interface JobTracker {
  _id: Id<"jobTrackers">;
  userId: Id<"users">;
  authUserId: string;
  company: string;
  role: string;
  jobUrl?: string;
  salaryRange?: string;
  appliedAt?: number;
  status: "wishlist" | "applied" | "phone_screen" | "interview" | "offer" | "rejected" | "accepted";
  createdAt: number;
  updatedAt: number;
}
