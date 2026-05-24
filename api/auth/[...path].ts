import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "node:http";

interface VercelLikeRequest extends IncomingMessage {
  query?: {
    path?: string[] | string;
  };
  headers: IncomingHttpHeaders;
  method?: string;
  url?: string;
}

function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer | string) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    req.on("end", () => {
      resolve(chunks.length > 0 ? Buffer.concat(chunks) : undefined);
    });
    req.on("error", reject);
  });
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function copyResponseHeaders(
  response: Response,
  res: ServerResponse,
) {
  const setCookies =
    "getSetCookie" in response.headers
      ? response.headers.getSetCookie()
      : [];

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return;
    }

    res.setHeader(key, value);
  });

  if (setCookies.length > 0) {
    res.setHeader("set-cookie", setCookies);
  }
}

export default async function handler(
  req: VercelLikeRequest,
  res: ServerResponse,
) {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;

  if (!convexSiteUrl) {
    res.statusCode = 500;
    res.end("Missing CONVEX_SITE_URL.");
    return;
  }

  const pathSegments = Array.isArray(req.query?.path)
    ? req.query.path
    : req.query?.path
      ? [req.query.path]
      : [];
  const requestPath = pathSegments.join("/");
  const requestUrl = new URL(req.url ?? "/", "https://vercel.local");
  const search = requestUrl.search;
  const targetUrl = `${convexSiteUrl.replace(/\/$/, "")}/api/auth/${requestPath}${search}`;
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) {
      continue;
    }

    if (key === "host" || key === "content-length" || key === "connection") {
      continue;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
      continue;
    }

    headers.set(key, value);
  }

  headers.set(
    "x-better-auth-forwarded-host",
    getHeaderValue(req.headers["x-forwarded-host"]) ??
      req.headers.host ??
      "",
  );
  headers.set(
    "x-better-auth-forwarded-proto",
    getHeaderValue(req.headers["x-forwarded-proto"]) ?? "https",
  );

  const method = req.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD" ? undefined : await readBody(req);
  const response = await fetch(targetUrl, {
    method,
    headers,
    ...(body ? { body } : {}),
    redirect: "manual",
  });

  res.statusCode = response.status;
  copyResponseHeaders(response, res);
  res.end(Buffer.from(await response.arrayBuffer()));
}
