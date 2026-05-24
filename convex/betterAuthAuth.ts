import type { GenericCtx } from "@convex-dev/better-auth";
import { convex as convexPlugin } from "@convex-dev/better-auth/plugins";
import authConfig from "./auth.config";
import { betterAuth } from "better-auth";
import type { DataModel } from "./_generated/dataModel";
import { betterAuthComponent } from "./betterAuth";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function getSiteUrl(): string {
  return getRequiredEnv("SITE_URL");
}

function getAllowedHosts(siteUrl: string): string[] {
  const hostname = new URL(siteUrl).hostname;

  return [
    hostname,
    "localhost",
    "127.0.0.1",
    "localhost:5173",
    "127.0.0.1:5173",
    "*.vercel.app",
  ];
}

function getSocialProviders() {
  const googleClientId = getOptionalEnv("GOOGLE_CLIENT_ID");
  const googleClientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");
  const githubClientId = getOptionalEnv("GITHUB_CLIENT_ID");
  const githubClientSecret = getOptionalEnv("GITHUB_CLIENT_SECRET");

  return {
    ...(googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {}),
    ...(githubClientId && githubClientSecret
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
          },
        }
      : {}),
  };
}

export function createAuth(ctx: GenericCtx<DataModel>) {
  const siteUrl = getSiteUrl();

  return betterAuth({
    secret: getRequiredEnv("BETTER_AUTH_SECRET"),
    database: betterAuthComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    baseURL: {
      fallback: siteUrl,
      allowedHosts: getAllowedHosts(siteUrl),
      protocol: "auto",
    },
    advanced: {
      trustedProxyHeaders: true,
    },
    socialProviders: getSocialProviders(),
    plugins: [
      convexPlugin({ authConfig }),
    ],
  });
}
