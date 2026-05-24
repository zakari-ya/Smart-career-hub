import { createClient } from "@convex-dev/better-auth";
import type { ComponentApi } from "@convex-dev/better-auth/_generated/component.js";
import type { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";

const installedBetterAuth = (components as unknown as {
  betterAuth: ComponentApi<"betterAuth">;
}).betterAuth;

export const betterAuthApi = installedBetterAuth;
export const betterAuthComponent = createClient<DataModel>(installedBetterAuth);
export const { getAuthUser } = betterAuthComponent.clientApi();
