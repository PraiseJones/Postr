import Link from "next/link";
import { PenSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/lib/platforms/types";
import Card from "@/components/ui/card";
import FadeIn from "@/components/ui/fade-in";
import Button from "@/components/ui/button";
import PlatformIcon from "@/components/platform-icon";
import StatusBadge, { type ResultStatus } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session!.user;

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, media_url, created_at, post_results(platform, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">History</h1>
        <p className="mt-1 text-sm text-white/55">
          Everything you&apos;ve published, with per-platform results.
        </p>
      </div>

      {!posts || posts.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-white/55">Nothing here yet.</p>
          <Link href="/compose">
            <Button variant="secondary" className="mt-4">
              <PenSquare size={16} strokeWidth={1.5} />
              Write your first post
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/55">
                <th className="px-6 py-4 font-medium">Post</th>
                <th className="hidden px-6 py-4 font-medium sm:table-cell">
                  Date
                </th>
                <th className="px-6 py-4 font-medium">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.map((post) => (
                <tr key={post.id} className="transition-colors duration-150 hover:bg-white/5">
                  <td className="max-w-xs px-6 py-4">
                    <Link href={`/history/${post.id}`} className="block">
                      <span className="line-clamp-2">
                        {post.content || "(media only)"}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden whitespace-nowrap px-6 py-4 text-white/55 sm:table-cell">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </FadeIn>
  );
}
