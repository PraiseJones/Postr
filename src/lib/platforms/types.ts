export const PLATFORMS = ["x", "facebook", "instagram", "linkedin"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  x: "X (Twitter)",
  facebook: "Facebook Page",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

export const CHAR_LIMITS: Record<Platform, number> = {
  x: 280,
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
};

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: Platform;
  account_name: string;
  account_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
}

export interface PublishInput {
  text: string;
  mediaUrl: string | null;
}

export interface PublishResult {
  ok: boolean;
  platformPostId?: string;
  error?: string;
}

export interface PlatformAdapter {
  /** Build the provider authorization URL for the OAuth dance. */
  getAuthUrl(
    state: string,
    extras?: { codeChallenge?: string; origin?: string }
  ): string;
  /**
   * Exchange the callback code for tokens and resolve the account to store
   * (for Meta platforms this resolves the Page / IG business account).
   *
   * `origin` must match the one used for getAuthUrl — providers compare the
   * redirect_uri across both calls.
   */
  exchangeCode(
    code: string,
    extras?: { codeVerifier?: string; origin?: string }
  ): Promise<
    Omit<ConnectedAccount, "id" | "user_id" | "platform">
  >;
  /** Publish a post using a stored account. */
  publish(account: ConnectedAccount, input: PublishInput): Promise<PublishResult>;
}

/**
 * OAuth redirect URI for a platform.
 *
 * Prefers NEXT_PUBLIC_APP_URL so the value is deterministic and matches what
 * is registered with each provider, but falls back to the origin of the
 * incoming request so the flow still works when the variable is unset (and on
 * preview deployments). A trailing slash on the env var is stripped — leaving
 * it in produces a double slash that providers reject as a mismatch.
 */
export function redirectUri(platform: Platform, requestOrigin?: string) {
  const base = (process.env.NEXT_PUBLIC_APP_URL || requestOrigin || "").replace(
    /\/+$/,
    ""
  );
  if (!base) {
    throw new Error(
      "Cannot build an OAuth redirect URI: set NEXT_PUBLIC_APP_URL to your site's URL."
    );
  }
  return `${base}/api/connect/${platform}/callback`;
}
