import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/lib/platforms/types";
import FadeIn from "@/components/ui/fade-in";
import ComposeForm from "@/components/compose-form";

export default async function ComposePage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session!.user;

  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("platform, account_name")
    .eq("user_id", user.id);

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Compose</h1>
        <p className="mt-1 text-sm text-white/55">
          Write once, publish everywhere.
        </p>
      </div>
      <ComposeForm
        connectedPlatforms={
          (accounts ?? []).map((a) => a.platform) as Platform[]
        }
      />
    </FadeIn>
  );
}
