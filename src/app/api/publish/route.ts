import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  adapters,
  isPlatform,
  CHAR_LIMITS,
  type ConnectedAccount,
  type Platform,
} from "@/lib/platforms";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const text: string = (body.text ?? "").trim();
  const mediaUrl: string | null = body.mediaUrl ?? null;
  const platforms: Platform[] = Array.isArray(body.platforms)
    ? body.platforms.filter((p: string) => isPlatform(p))
    : [];

  if (!text && !mediaUrl) {
    return NextResponse.json({ error: "Post is empty" }, { status: 400 });
  }
  if (platforms.length === 0) {
    return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
  }
  for (const p of platforms) {
    if (text.length > CHAR_LIMITS[p]) {
      return NextResponse.json(
        { error: `Text exceeds the ${CHAR_LIMITS[p]}-character limit for ${p}` },
        { status: 400 }
      );
    }
  }
  if (platforms.includes("instagram") && !mediaUrl) {
    return NextResponse.json(
      { error: "Instagram requires an image" },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  const { data: accounts, error: accountsError } = await service
    .from("connected_accounts")
    .select("*")
    .eq("user_id", user.id)
    .in("platform", platforms);
  if (accountsError) {
    return NextResponse.json({ error: accountsError.message }, { status: 500 });
  }

  const missing = platforms.filter(
    (p) => !accounts?.some((a) => a.platform === p)
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Not connected: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ user_id: user.id, content: text, media_url: mediaUrl })
    .select()
    .single();
  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }

  // Publish to all platforms in parallel; each failure is recorded, never thrown.
  const results = await Promise.all(
    platforms.map(async (platform) => {
      const account = accounts!.find((a) => a.platform === platform) as ConnectedAccount;
      const result = await adapters[platform].publish(account, { text, mediaUrl });
      if (!result.ok) {
        Sentry.captureMessage(`Publish failed on ${platform}: ${result.error}`);
      }
      await service.from("post_results").insert({
        post_id: post.id,
        user_id: user.id,
        platform,
        status: result.ok ? "success" : "failed",
        platform_post_id: result.platformPostId ?? null,
        error_message: result.error ?? null,
        posted_at: result.ok ? new Date().toISOString() : null,
      });
      return { platform, ...result };
    })
  );

  return NextResponse.json({ postId: post.id, results });
}
