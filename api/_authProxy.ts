import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "node:http";

interface VercelLikeRequest extends IncomingMessage {
  query?: {
    authPath?: string[] | string;
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

function getAuthPathFromQuery(path: string[] | string | undefined): string | null {
  if (Array.isArray(path)) {
    return path.filter((part) => part.length > 0).join("/");
  }

  if (typeof path === "string" && path.length > 0) {
    return path;
  }

  return null;
}

function parseRequestUrl(url: string | undefined): {
  pathnameAuthPath: string;
  queryAuthPath: string | null;
  search: string;
} {
  const requestUrl = new URL(url ?? "/", "https://vercel.local");
  const pathnameAuthPath = requestUrl.pathname
    .replace(/^\/api\/auth\/?/, "")
    .replace(/^\/+|\/+$/g, "");
  const queryAuthPath = requestUrl.searchParams.get("authPath");

  requestUrl.searchParams.delete("authPath");

  return {
    pathnameAuthPath,
    queryAuthPath,
    search: requestUrl.search,
  };
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

export async function authProxyHandler(
  req: VercelLikeRequest,
  res: ServerResponse,
) {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;

  if (!convexSiteUrl) {
    res.statusCode = 500;
    res.end("Missing CONVEX_SITE_URL.");
    return;
  }

  const parsedUrl = parseRequestUrl(req.url);
  const requestPath = (
    getAuthPathFromQuery(req.query?.authPath) ??
    parsedUrl.queryAuthPath ??
    getAuthPathFromQuery(req.query?.path) ??
    parsedUrl.pathnameAuthPath
  ).replace(/^\/+|\/+$/g, "");
  const authPath = requestPath.length > 0 ? `/${requestPath}` : "";
  const targetBaseUrl = `${convexSiteUrl.replace(/\/$/, "")}/api/auth`;
  const targetUrl = `${targetBaseUrl}${authPath}${parsedUrl.search}`;
  const forwardedHost =
    getHeaderValue(req.headers["x-forwarded-host"]) ?? req.headers.host ?? "";
  const forwardedProto =
    getHeaderValue(req.headers["x-forwarded-proto"]) ?? "https";

  if (requestPath === "__debug") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(
      JSON.stringify(
        {
          configured: true,
          incomingUrl: req.url ?? null,
          queryAuthPath: req.query?.authPath ?? null,
          queryPath: req.query?.path ?? null,
          derivedAuthPath: requestPath,
          convexAuthBaseUrl: targetBaseUrl,
          sampleGetSessionTarget: `${targetBaseUrl}/get-session`,
          forwardedHost,
          forwardedProto,
        },
        null,
        2,
      ),
    );
    return;
  }

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

  headers.set("host", new URL(convexSiteUrl).host);
  headers.set("x-forwarded-host", forwardedHost);
  headers.set("x-forwarded-proto", forwardedProto);
  headers.set("x-better-auth-forwarded-host", forwardedHost);
  headers.set("x-better-auth-forwarded-proto", forwardedProto);

  const method = req.method ?? "GET";
  const body =
    method === "GET" || method === "HEAD" ? undefined : await readBody(req);
  let response: Response;

  try {
    response = await fetch(targetUrl, {
      method,
      headers,
      ...(body !== undefined ? { body } : {}),
      redirect: "manual",
    });
  } catch {
    res.statusCode = 502;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("Unable to reach Convex auth endpoint.");
    return;
  }

  res.statusCode = response.status;
  copyResponseHeaders(response, res);
  res.end(Buffer.from(await response.arrayBuffer()));
}
