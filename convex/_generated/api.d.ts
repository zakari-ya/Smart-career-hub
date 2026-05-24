/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analyses from "../analyses.js";
import type * as analysis from "../analysis.js";
import type * as analysisActions from "../analysisActions.js";
import type * as analyzePipeline from "../analyzePipeline.js";
import type * as analyzePipelineActions from "../analyzePipelineActions.js";
import type * as auth from "../auth.js";
import type * as betterAuth from "../betterAuth.js";
import type * as betterAuthAuth from "../betterAuthAuth.js";
import type * as compliance from "../compliance.js";
import type * as extraction from "../extraction.js";
import type * as guest from "../guest.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_hash from "../lib/hash.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_parser from "../lib/parser.js";
import type * as lib_rateLimiter from "../lib/rateLimiter.js";
import type * as lib_resumeUpload from "../lib/resumeUpload.js";
import type * as lib_security from "../lib/security.js";
import type * as lib_validators from "../lib/validators.js";
import type * as portfolio from "../portfolio.js";
import type * as resumes from "../resumes.js";
import type * as scheduled from "../scheduled.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analyses: typeof analyses;
  analysis: typeof analysis;
  analysisActions: typeof analysisActions;
  analyzePipeline: typeof analyzePipeline;
  analyzePipelineActions: typeof analyzePipelineActions;
  auth: typeof auth;
  betterAuth: typeof betterAuth;
  betterAuthAuth: typeof betterAuthAuth;
  compliance: typeof compliance;
  extraction: typeof extraction;
  guest: typeof guest;
  http: typeof http;
  jobs: typeof jobs;
  "lib/auth": typeof lib_auth;
  "lib/hash": typeof lib_hash;
  "lib/openrouter": typeof lib_openrouter;
  "lib/parser": typeof lib_parser;
  "lib/rateLimiter": typeof lib_rateLimiter;
  "lib/resumeUpload": typeof lib_resumeUpload;
  "lib/security": typeof lib_security;
  "lib/validators": typeof lib_validators;
  portfolio: typeof portfolio;
  resumes: typeof resumes;
  scheduled: typeof scheduled;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
