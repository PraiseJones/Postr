import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { adapters, isPlatform } from "@/lib/platforms";

// Starts the OAuth dance: sets state (and PKCE verifier for X) in httpOnly
// cookies, then redirects to the provider.
export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;
  if (!isPlatform(platform)) {
    return NextResponse.json({ error: "Unknown platform" }, { status: 404 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const state = crypto.randomBytes(16).toString("hex");
  let codeChallenge: string | undefined;
  let codeVerifier: string | undefined;

  if (platform === "x") {
    codeVerifier = crypto.randomBytes(32).toString("base64url");
    codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");
  }

  // Fall back to this request's own origin when NEXT_PUBLIC_APP_URL is unset.
  const origin = request.nextUrl.origin;

  let authUrl: string;
  try {
    authUrl = adapters[platform].getAuthUrl(state, { codeChallenge, origin });
  } catch (e) {
    const url = new URL("/accounts", origin);
    url.searchParams.set(
      "error",
      e instanceof Error ? e.message : "Could not start the connection"
    );
    return NextResponse.redirect(url);
  }

  const response = NextResponse.redirect(authUrl);
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  response.cookies.set(`oauth_state_${platform}`, state, cookieOpts);
  if (codeVerifier) {
    response.cookies.set(`oauth_verifier_${platform}`, codeVerifier, cookieOpts);
  }
  return response;
}
