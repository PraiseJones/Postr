import {
  PlatformAdapter,
  PublishInput,
  PublishResult,
  redirectUri,
} from "./types";

// Instagram — Meta Graph API content publishing. Requires an Instagram
// Business/Creator account linked to a Facebook Page, and every post must
// include media (Instagram has no text-only posts).

const GRAPH = "https://graph.facebook.com/v21.0";

export const instagramAdapter: PlatformAdapter = {
  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      redirect_uri: redirectUri("instagram"),
      state,
      scope:
        "instagram_basic,instagram_content_publish,pages_show_list,business_management",
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
  },

  async exchangeCode(code) {
    const tokenRes = await fetch(
      `${GRAPH}/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.META_APP_ID!,
          client_secret: process.env.META_APP_SECRET!,
          redirect_uri: redirectUri("instagram"),
          code,
        })
    );
    if (!tokenRes.ok) {
      throw new Error(`Instagram token exchange failed: ${await tokenRes.text()}`);
    }
    const { access_token: userToken } = await tokenRes.json();

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

    // Find the first Page with a linked IG business account.
    const pagesRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${longLived}`
    );
    const pages = await pagesRes.json();
    const page = pages.data?.find((p: any) => p.instagram_business_account);
    if (!page) {
      throw new Error(
        "No Instagram Business account found. Link an Instagram Business/Creator account to one of your Facebook Pages first."
      );
    }

    return {
      account_name: `@${page.instagram_business_account.username}`,
      account_id: page.instagram_business_account.id,
      access_token: longLived,
      refresh_token: null,
      expires_at: null,
    };
  },

  async publish(account, input: PublishInput): Promise<PublishResult> {
    try {
      if (!input.mediaUrl) {
        return {
          ok: false,
          error: "Instagram requires an image — text-only posts are not supported.",
        };
      }

      // Two-step publish: create a media container, then publish it.
      const containerRes = await fetch(`${GRAPH}/${account.account_id}/media`, {
        method: "POST",
        body: new URLSearchParams({
          image_url: input.mediaUrl,
          caption: input.text,
          access_token: account.access_token,
        }),
      });
      const container = await containerRes.json();
      if (!containerRes.ok || container.error) {
        return {
          ok: false,
          error: container.error?.message || `IG container error (${containerRes.status})`,
        };
      }

      const publishRes = await fetch(
        `${GRAPH}/${account.account_id}/media_publish`,
        {
          method: "POST",
          body: new URLSearchParams({
            creation_id: container.id,
            access_token: account.access_token,
          }),
        }
      );
      const published = await publishRes.json();
      if (!publishRes.ok || published.error) {
        return {
          ok: false,
          error: published.error?.message || `IG publish error (${publishRes.status})`,
        };
      }
      return { ok: true, platformPostId: published.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
    }
  },
};
