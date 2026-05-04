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
import type * as auth from "../auth.js";
import type * as compliance from "../compliance.js";
import type * as guest from "../guest.js";
import type * as jobs from "../jobs.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_rateLimiter from "../lib/rateLimiter.js";
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
  auth: typeof auth;
  compliance: typeof compliance;
  guest: typeof guest;
  jobs: typeof jobs;
  "lib/openrouter": typeof lib_openrouter;
  "lib/rateLimiter": typeof lib_rateLimiter;
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

export declare const components: {};
