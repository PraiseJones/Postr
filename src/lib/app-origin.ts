import type { NextRequest } from "next/server";

/**
 * The public origin of this deployment, e.g. https://onepostr.vercel.app
 *
 * OAuth providers compare the redirect_uri byte-for-byte against what is
 * registered, so this has to be exact.
 *
 * NEXT_PUBLIC_APP_URL wins when set — it is the only way to guarantee preview
 * deployments send the same URI as production. Otherwise we reconstruct it
 * from the forwarded headers a proxy sets: behind Vercel, request.nextUrl can
 * report http:// even though the browser used https://, and that mismatch
 * alone is enough for a provider to reject the request.
 */
type HeaderGetter = (name: string) => string | null | undefined;

function fromHeaders(get: HeaderGetter): string | null {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  const host = get("x-forwarded-host") ?? get("host");
  if (!host) return null;

  // Only localhost gets http. Everything else is https regardless of what the
  // proxy reports: a public deployment is served over TLS, providers reject an
  // http:// callback for a public host, and a stray x-forwarded-proto: http
  // would otherwise produce a redirect URI that fails to match.
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0");
  return `${isLocal ? "http" : "https"}://${host}`;
}

export function appOrigin(request: NextRequest): string {
  return fromHeaders((n) => request.headers.get(n)) ?? request.nextUrl.origin;
}

/** Same value, for server components (which have headers() but no request). */
export function appOriginFromHeaders(headerList: {
  get(name: string): string | null;
}): string {
  return fromHeaders((n) => headerList.get(n)) ?? "";
}
