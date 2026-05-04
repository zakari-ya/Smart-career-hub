import { action } from "./_generated/server";
import { v } from "convex/values";

export const fetchGithubProfile = action({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(`https://api.github.com/users/${args.username}/repos?sort=updated&per_page=5`);
    if (!response.ok) throw new Error("Failed to fetch GitHub repos");
    const data = await response.json() as { name?: string; description?: string; stargazers_count?: number; forks_count?: number; language?: string; html_url?: string }[];
    return data.map((r: Record<string, unknown>) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
    }));
  },
});
