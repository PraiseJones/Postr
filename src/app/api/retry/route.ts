import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { adapters, type ConnectedAccount, type Platform } from "@/lib/platforms";

// Retries a single failed post_result.
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resultId } = await request.json();
  if (typeof resultId !== "string") {
    return NextResponse.json({ error: "resultId required" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: result } = await service
    .from("post_results")
    .select("*, posts(content, media_url)")
    .eq("id", resultId)
    .eq("user_id", user.id)
    .single();
  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }
  if (result.status === "success") {
    return NextResponse.json({ error: "Already published" }, { status: 400 });
  }

  const platform = result.platform as Platform;
  const { data: account } = await service
    .from("connected_accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", platform)
    .single();
  if (!account) {
    return NextResponse.json(
      { error: `${platform} is no longer connected` },
      { status: 400 }
    );
  }

  const publishResult = await adapters[platform].publish(
    account as ConnectedAccount,
    { text: result.posts.content, mediaUrl: result.posts.media_url }
  );
  if (!publishResult.ok) {
    Sentry.captureMessage(`Retry failed on ${platform}: ${publishResult.error}`);
  }

  await service
    .from("post_results")
    .update({
      status: publishResult.ok ? "success" : "failed",
      platform_post_id: publishResult.platformPostId ?? null,
      error_message: publishResult.error ?? null,
      posted_at: publishResult.ok ? new Date().toISOString() : null,
    })
    .eq("id", resultId);

  return NextResponse.json({ platform, ...publishResult });
}
