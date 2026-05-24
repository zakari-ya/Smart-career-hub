export const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_RESUME_FILE_TYPES = ["pdf", "txt", "md"] as const;

export type ResumeFileType = (typeof ALLOWED_RESUME_FILE_TYPES)[number];

export function isAllowedResumeFileType(
  value: string,
): value is ResumeFileType {
  return ALLOWED_RESUME_FILE_TYPES.includes(value as ResumeFileType);
}
