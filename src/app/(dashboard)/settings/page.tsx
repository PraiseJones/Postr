import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/card";
import FadeIn from "@/components/ui/fade-in";
import { formatDate } from "@/lib/utils";

const API_KEYS = [
  { name: "X (Twitter)", env: "X_CLIENT_ID / X_CLIENT_SECRET" },
  { name: "Meta (Facebook + Instagram)", env: "META_APP_ID / META_APP_SECRET" },
  { name: "LinkedIn", env: "LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET" },
];

function isConfigured(env: string) {
  return env
    .split(" / ")
    .every((key) => Boolean(process.env[key] && process.env[key]!.length > 0));
}

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session!.user;

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-white/55">
          Profile and API configuration.
        </p>
      </div>

      <Card>
        <h2 className="font-serif text-2xl">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-3">
            <dt className="text-white/55">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/55">Member since</dt>
            <dd>{formatDate(user.created_at)}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-serif text-2xl">API configuration</h2>
        <p className="mt-2 text-sm text-white/55">
          Platform credentials are read from server environment variables —
          see <code className="rounded bg-white/5 px-1.5 py-0.5">.env.example</code>{" "}
          for setup instructions.
        </p>
        <ul className="mt-4 space-y-3">
          {API_KEYS.map(({ name, env }) => {
            const ok = isConfigured(env);
            return (
              <li
                key={name}
                className="flex items-center justify-between border-b border-white/5 pb-3 text-sm last:border-0 last:pb-0"
              >
                <div>
                  <p>{name}</p>
                  <p className="text-xs text-white/55">{env}</p>
                </div>
                <span
                  className={
                    ok
                      ? "rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs text-success"
                      : "rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/55"
                  }
                >
                  {ok ? "Configured" : "Missing"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </FadeIn>
  );
}
