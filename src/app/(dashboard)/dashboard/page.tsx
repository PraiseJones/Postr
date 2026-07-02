import Link from "next/link";
import { PenSquare, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PLATFORMS, PLATFORM_LABELS, type Platform } from "@/lib/platforms/types";
import Card from "@/components/ui/card";
import FadeIn from "@/components/ui/fade-in";
import PlatformIcon from "@/components/platform-icon";
import StatusBadge, { type ResultStatus } from "@/components/status-badge";
import Button from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session!.user;

  const [{ data: accounts }, { data: posts }] = await Promise.all([
    supabase
      .from("connected_accounts")
      .select("platform, account_name")
      .eq("user_id", user.id),
    supabase
      .from("posts")
      .select("id, content, created_at, post_results(platform, status)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const connected = new Map(
    (accounts ?? []).map((a) => [a.platform as Platform, a.account_name])
  );

  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/55">
            {connected.size} of {PLATFORMS.length} platforms connected
          </p>
        </div>
        <Link href="/compose">
          <Button>
            <PenSquare size={16} strokeWidth={1.5} />
            New post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLATFORMS.map((platform) => {
          const name = connected.get(platform);
          return (
            <Card key={platform} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-white/10">
                <PlatformIcon platform={platform} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{PLATFORM_LABELS[platform]}</p>
                <p className="truncate text-xs text-white/55">
                  {name ?? "Not connected"}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Recent posts</h2>
          <Link
            href="/history"
            className="text-sm text-white/55 transition-colors duration-150 hover:text-white"
          >
            View all
          </Link>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-white/55">No posts yet.</p>
            <Link href={connected.size === 0 ? "/accounts" : "/compose"}>
              <Button variant="secondary" className="mt-4">
                {connected.size === 0 ? (
                  <>
                    <Link2 size={16} strokeWidth={1.5} /> Connect an account
                  </>
                ) : (
                  <>
                    <PenSquare size={16} strokeWidth={1.5} /> Write your first post
                  </>
                )}
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {posts.map((post) => (
              <li key={post.id} className="py-4">
                <Link href={`/history/${post.id}`} className="group block">
                  <p className="line-clamp-2 text-sm group-hover:text-white">
                    {post.content || "(media only)"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-white/55">
                      {formatDate(post.created_at)}
                    </span>
                    {post.post_results.map((r) => (
                      <span key={r.platform} className="flex items-center gap-1.5">
                        <PlatformIcon
                          platform={r.platform as Platform}
                          size={14}
                          className="text-white/55"
                        />
                        <StatusBadge status={r.status as ResultStatus} />
                      </span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </FadeIn>
  );
}
