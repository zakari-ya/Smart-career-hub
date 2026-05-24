import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./betterAuth";
import { createAuth } from "./betterAuthAuth";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth);

export default http;
