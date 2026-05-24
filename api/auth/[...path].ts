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
  const search = req.url?.includes("?")
    ? req.url.slice(req.url.indexOf("?"))
    : "";
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
    (req.headers["x-forwarded-host"] as string | undefined) ??
      req.headers.host ??
      "",
  );
  headers.set(
    "x-better-auth-forwarded-proto",
    (req.headers["x-forwarded-proto"] as string | undefined) ?? "https",
  );

  const method = req.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD" ? undefined : await readBody(req);

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  res.statusCode = response.status;
  copyResponseHeaders(response, res);
  res.end(Buffer.from(await response.arrayBuffer()));
}
