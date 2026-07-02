import { createClient } from "@/lib/supabase/server";
import { PLATFORMS, type Platform } from "@/lib/platforms/types";
import FadeIn from "@/components/ui/fade-in";
import AccountCard from "@/components/account-card";
import ConnectToast from "@/components/connect-toast";

export default async function AccountsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: accounts } = await supabase
    .from("connected_accounts")
    .select("platform, account_name, created_at")
    .eq("user_id", user!.id);

  const byPlatform = new Map(
    (accounts ?? []).map((a) => [a.platform as Platform, a])
  );

  return (
    <FadeIn className="space-y-6">
      <ConnectToast />
      <div>
        <h1 className="font-serif text-4xl">Accounts</h1>
        <p className="mt-1 text-sm text-white/55">
          Connect the platforms you want to publish to. Tokens are stored
          server-side and never exposed to the browser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PLATFORMS.map((platform) => (
          <AccountCard
            key={platform}
            platform={platform}
            accountName={byPlatform.get(platform)?.account_name ?? null}
            connectedAt={byPlatform.get(platform)?.created_at ?? null}
          />
        ))}
      </div>

      <p className="text-xs leading-relaxed text-white/55">
        Notes: Facebook publishes to a Page you manage (Meta&apos;s API does not
        allow personal-profile posting). Instagram requires a Business or
        Creator account linked to a Facebook Page, and every Instagram post
        must include an image.
      </p>
    </FadeIn>
  );
}
