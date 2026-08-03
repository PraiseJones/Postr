import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { adapters, isPlatform } from "@/lib/platforms";
import { appOrigin } from "@/lib/app-origin";

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;
  // Derive from the incoming request so a missing NEXT_PUBLIC_APP_URL can't
  // throw here — this route is where the user lands back from the provider,
  // and an exception surfaces as a bare 500 with no explanation.
  const origin = appOrigin(request);
  const accountsUrl = new URL("/accounts", origin);

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

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error_description") || url.searchParams.get("error");

  const expectedState = request.cookies.get(`oauth_state_${platform}`)?.value;
  const codeVerifier = request.cookies.get(`oauth_verifier_${platform}`)?.value;

  const fail = (message: string) => {
    accountsUrl.searchParams.set("error", message);
    const res = NextResponse.redirect(accountsUrl);
    res.cookies.delete(`oauth_state_${platform}`);
    res.cookies.delete(`oauth_verifier_${platform}`);
    return res;
  };

  if (providerError) return fail(providerError);
  if (!code || !state || state !== expectedState) {
    return fail("OAuth state mismatch — please try connecting again.");
  }

  try {
    const account = await adapters[platform].exchangeCode(code, {
      codeVerifier,
      origin,
    });

    // Tokens are written with the service role and never sent to the browser.
    const service = createServiceClient();
    const { error } = await service.from("connected_accounts").upsert(
      {
        user_id: user.id,
        platform,
        ...account,
      },
      { onConflict: "user_id,platform" }
    );
    if (error) throw new Error(error.message);
  } catch (e) {
    Sentry.captureException(e);
    return fail(e instanceof Error ? e.message : "Connection failed");
  }

  accountsUrl.searchParams.set("connected", platform);
  const res = NextResponse.redirect(accountsUrl);
  res.cookies.delete(`oauth_state_${platform}`);
  res.cookies.delete(`oauth_verifier_${platform}`);
  return res;
}
