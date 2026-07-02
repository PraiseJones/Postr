import {
  PlatformAdapter,
  PublishInput,
  PublishResult,
  redirectUri,
} from "./types";

// Facebook — Meta Graph API. Posting is only possible to Pages the user
// manages (Meta removed personal-profile posting). We store the first
// managed Page and its long-lived Page token.

const GRAPH = "https://graph.facebook.com/v21.0";

export const facebookAdapter: PlatformAdapter = {
  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri("facebook"),
      state,
      scope: "pages_show_list,pages_manage_posts,pages_read_engagement",
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
  },

  async exchangeCode(code) {
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          redirect_uri: redirectUri("facebook"),
          code,
        })
    );
    if (!tokenRes.ok) {
      throw new Error(`Facebook token exchange failed: ${await tokenRes.text()}`);
    }
    const { access_token: userToken } = await tokenRes.json();

    // Long-lived user token → Page tokens returned from /me/accounts are
    // then long-lived too.
    const longRes = await fetch(
      `${GRAPH}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          fb_exchange_token: userToken,
        })
    );
    const longLived = longRes.ok ? (await longRes.json()).access_token : userToken;

    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,access_token&access_token=${longLived}`
    );
    const pages = await pagesRes.json();
    const page = pages.data?.[0];
    if (!page) {
      throw new Error(
        "No Facebook Page found. Posting requires a Page you manage — personal profiles are not supported by Meta's API."
      );
    }

    return {
      account_name: page.name,
      account_id: page.id,
      access_token: page.access_token,
      refresh_token: null,
      expires_at: null,
    };
  },

  async publish(account, input: PublishInput): Promise<PublishResult> {
    try {
      const isPhoto = !!input.mediaUrl;
      const endpoint = isPhoto
        ? `${GRAPH}/${account.account_id}/photos`
        : `${GRAPH}/${account.account_id}/feed`;
      const body = new URLSearchParams({ access_token: account.access_token });
      if (isPhoto) {
        body.set("url", input.mediaUrl!);
        body.set("caption", input.text);
      } else {
        body.set("message", input.text);
      }

      const res = await fetch(endpoint, { method: "POST", body });
      const json = await res.json();
      if (!res.ok || json.error) {
        return { ok: false, error: json.error?.message || `Graph API error (${res.status})` };
      }
      return { ok: true, platformPostId: json.post_id || json.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  },
};
