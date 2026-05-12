/**
 * Generates a simple hash of the provided string content.
 * Used for identifying identical resumes in the caching layer.
 * Pure JS implementation to work in Convex default runtime (mutations).
 */
export function generateHash(content: string): string {
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
