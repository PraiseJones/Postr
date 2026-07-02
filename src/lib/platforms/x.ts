import {
  ConnectedAccount,
  PlatformAdapter,
  PublishInput,
  PublishResult,
  redirectUri,
} from "./types";

// X (Twitter) — OAuth 2.0 with PKCE + v2 API.
// Docs: https://docs.x.com/x-api/fundamentals/authentication

const AUTH_URL = "https://x.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.x.com/2/oauth2/token";
const API = "https://api.x.com/2";

function basicAuth() {
  return Buffer.from(
    `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
  ).toString("base64");
}

async function refreshToken(account: ConnectedAccount): Promise<string> {
  if (!account.refresh_token) return account.access_token;
  const expired =
    account.expires_at && new Date(account.expires_at).getTime() < Date.now() + 60_000;
  if (!expired) return account.access_token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth()}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });
  if (!res.ok) throw new Error(`X token refresh failed (${res.status})`);
  const json = await res.json();

  const { createServiceClient } = await import("@/lib/supabase/server");
  await createServiceClient()
    .from("connected_accounts")
    .update({
      access_token: json.access_token,
      refresh_token: json.refresh_token ?? account.refresh_token,
      expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString(),
    })
    .eq("id", account.id);

  return json.access_token;
}

export const xAdapter: PlatformAdapter = {
  getAuthUrl(state, extras) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.X_CLIENT_ID!,
      redirect_uri: redirectUri("x"),
      scope: "tweet.read tweet.write users.read offline.access",
      state,
      code_challenge: extras!.codeChallenge!,
      code_challenge_method: "S256",
    });
    return `${AUTH_URL}?${params}`;
  },

  async exchangeCode(code, extras) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth()}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri("x"),
        code_verifier: extras!.codeVerifier!,
      }),
    });
    if (!res.ok) {
      throw new Error(`X token exchange failed: ${await res.text()}`);
    }
    const token = await res.json();

    const meRes = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!meRes.ok) throw new Error("Could not load X profile");
    const me = await meRes.json();

    return {
      account_name: `@${me.data.username}`,
      account_id: me.data.id,
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? null,
      expires_at: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null,
    };
  },

  async publish(account, input: PublishInput): Promise<PublishResult> {
    try {
      const accessToken = await refreshToken(account);
      // v1 posts text (media upload on X requires the separate media
      // endpoint with OAuth 1.0a or chunked v2 upload — noted in README).
      const res = await fetch(`${API}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input.text }),
      });
      const json = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: json.detail || json.title || `X API error (${res.status})`,
        };
      }
      return { ok: true, platformPostId: json.data.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  },
};
