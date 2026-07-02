import {
  PlatformAdapter,
  PublishInput,
  PublishResult,
  redirectUri,
} from "./types";

// LinkedIn — OpenID Connect sign-in + "Share on LinkedIn" (ugcPosts).

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const API = "https://api.linkedin.com/v2";

export const linkedinAdapter: PlatformAdapter = {
  getAuthUrl(state) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri("linkedin"),
      state,
      scope: "openid profile w_member_social",
    });
    return `${AUTH_URL}?${params}`;
  },

  async exchangeCode(code) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri("linkedin"),
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    });
    if (!res.ok) {
      throw new Error(`LinkedIn token exchange failed: ${await res.text()}`);
    }
    const token = await res.json();

    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!meRes.ok) throw new Error("Could not load LinkedIn profile");
    const me = await meRes.json();

    return {
      account_name: me.name,
      account_id: `urn:li:person:${me.sub}`,
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? null,
      expires_at: token.expires_in
        ? new Date(Date.now() + token.expires_in * 1000).toISOString()
        : null,
    };
  },

  async publish(account, input: PublishInput): Promise<PublishResult> {
    try {
      const body: Record<string, unknown> = {
        author: account.account_id,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: input.text },
            shareMediaCategory: input.mediaUrl ? "ARTICLE" : "NONE",
            ...(input.mediaUrl
              ? {
                  media: [
                    { status: "READY", originalUrl: input.mediaUrl },
                  ],
                }
              : {}),
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const res = await fetch(`${API}/ugcPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          ok: false,
          error: err.message || `LinkedIn API error (${res.status})`,
        };
      }
      const id = res.headers.get("x-restli-id") || (await res.json().catch(() => ({}))).id;
      return { ok: true, platformPostId: id ?? undefined };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  },
};
