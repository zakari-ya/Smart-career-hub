import {
  ALLOWED_RESUME_FILE_TYPES,
  MAX_RESUME_FILE_SIZE_BYTES,
  isAllowedResumeFileType,
  type ResumeFileType,
} from "../../shared/uploadPolicy";

export { ALLOWED_RESUME_FILE_TYPES, MAX_RESUME_FILE_SIZE_BYTES };

export function validateResumeUpload(args: {
  fileType: string;
  fileSize: number;
}) {
  if (!isAllowedResumeFileType(args.fileType)) {
    throw new Error(
      `Unsupported file type. Allowed types: ${ALLOWED_RESUME_FILE_TYPES.join(", ")}.`,
    );
  }

  if (args.fileSize <= 0 || args.fileSize > MAX_RESUME_FILE_SIZE_BYTES) {
    throw new Error("File size must be between 1 byte and 5MB.");
  }

  return {
    fileType: args.fileType as ResumeFileType,
    fileSize: args.fileSize,
  };
}
