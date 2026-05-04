import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;

if (!convexUrl) {
  console.warn("Missing VITE_CONVEX_URL environment variable.");
}

export const convex = new ConvexReactClient(convexUrl || "http://localhost:3210");
