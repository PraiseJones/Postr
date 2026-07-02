# Postr

Compose once — publish to **X (Twitter), Facebook, Instagram and LinkedIn** in one click.

Dark-luxury editorial UI built with Next.js 14 (App Router), Tailwind CSS, Supabase (Auth + Postgres + Storage), Zustand, TanStack Query, GSAP micro-interactions, and Sentry.

## How it works

1. Sign up / sign in (Supabase Auth).
2. Connect accounts on **Accounts** — each platform runs a server-side OAuth flow; tokens are stored in Postgres with the service role and are never sent to the browser.
3. Write on **Compose** — pick platforms, watch per-platform character counters (280 for X), optionally attach an image (uploaded to Supabase Storage).
4. Hit **Publish** — the server posts to every selected platform in parallel and records a per-platform result.
5. **History** shows every post with success/failure per platform and a **Retry** button for failures.

## Setup

### 1. Install & configure

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in the SQL editor (tables, RLS policies, and the `post-media` storage bucket).
3. Fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

### 3. Platform credentials

Set `NEXT_PUBLIC_APP_URL` first (e.g. `http://localhost:3000`) — every redirect URI below derives from it.

| Platform | Where | What to do |
| --- | --- | --- |
| **X** | [developer.x.com](https://developer.x.com) | Create an app, enable OAuth 2.0 (confidential client), add redirect URI `{APP_URL}/api/connect/x/callback`, copy Client ID/Secret. Free tier allows ~500 posts/month. |
| **Facebook + Instagram** | [developers.facebook.com](https://developers.facebook.com) | One app covers both. Add "Facebook Login" product, add redirect URIs `{APP_URL}/api/connect/facebook/callback` and `{APP_URL}/api/connect/instagram/callback`. |
| **LinkedIn** | [developer.linkedin.com](https://developer.linkedin.com) | Create an app, request **"Sign In with LinkedIn using OpenID Connect"** and **"Share on LinkedIn"** products, add redirect URI `{APP_URL}/api/connect/linkedin/callback`. |

### 4. Run

```bash
npm run dev
```

## Platform caveats (by design, not bugs)

- **Facebook** posts to a **Page you manage** — Meta's API does not allow posting to personal profiles. The connect flow stores your first managed Page.
- **Instagram** requires a **Business/Creator account linked to a Facebook Page**, and every post **must include an image** (the API has no text-only posts). The composer enforces this.
- **X** publishes text posts via the v2 API. Attaching media to X posts requires the separate media-upload endpoint (chunked upload) — not wired up in v1; images still publish to Facebook/Instagram/LinkedIn.
- **Meta & LinkedIn app review**: while your Meta/LinkedIn apps are in development mode only you (and listed testers) can connect. Public use requires their review processes.
- Meta long-lived tokens expire after ~60 days; reconnect from the Accounts page when that happens.

## Architecture notes

- `src/lib/platforms/` — one adapter per platform (`getAuthUrl` / `exchangeCode` / `publish`) behind a common interface; adding a platform means adding one file.
- `src/app/api/connect/[platform]/` — OAuth start + callback route handlers (state cookie + PKCE for X).
- `src/app/api/publish/` — validates limits server-side, publishes in parallel, records `post_results`.
- OAuth tokens are readable only via the service-role client (`createServiceClient`); RLS lets users see and delete their own connections but the app never ships token columns to the client.
- Sentry activates only when `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` is set.
