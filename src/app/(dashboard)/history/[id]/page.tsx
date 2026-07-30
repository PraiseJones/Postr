import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATFORM_LABELS, type Platform } from "@/lib/platforms/types";
import Card from "@/components/ui/card";
import FadeIn from "@/components/ui/fade-in";
import PlatformIcon from "@/components/platform-icon";
import StatusBadge, { type ResultStatus } from "@/components/status-badge";
import RetryButton from "@/components/retry-button";
import { formatDate } from "@/lib/utils";

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session!.user;

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, content, media_url, created_at, post_results(id, platform, status, error_message, platform_post_id, posted_at)"
    )
    .eq("user_id", user.id)
    .eq("id", params.id)
    .single();

  if (!post) notFound();

  return (
    <FadeIn className="space-y-6">
      <div>
        <Link
          href="/history"
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/55 transition-colors duration-150 hover:text-white"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to history
        </Link>
        <h1 className="font-serif text-4xl">Post detail</h1>
        <p className="mt-1 text-sm text-white/55">
          Published {formatDate(post.created_at)}
        </p>
      </div>

      <Card>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {post.content || "(media only)"}
        </p>
        {post.media_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.media_url}
            alt="Post media"
            className="mt-4 max-h-72 rounded-xl border border-white/10 object-cover"
          />
        )}
      </Card>

      <Card className="p-0">
        <ul className="divide-y divide-white/5">
          {post.post_results.map((result) => (
            <li
              key={result.id}
              className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-white/10">
                  <PlatformIcon platform={result.platform as Platform} />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {PLATFORM_LABELS[result.platform as Platform]}
                  </p>
                  <p className="text-xs text-white/55">
                    {result.status === "success"
                      ? `Posted ${result.posted_at ? formatDate(result.posted_at) : ""}`
                      : (result.error_message ?? "Pending")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={result.status as ResultStatus} />
                {result.status === "failed" && (
                  <RetryButton resultId={result.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </FadeIn>
  );
}
