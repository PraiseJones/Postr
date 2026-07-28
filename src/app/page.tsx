import Link from "next/link";
import { Feather, PenSquare, ShieldCheck, Zap, RotateCcw } from "lucide-react";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/platforms/types";
import PlatformIcon from "@/components/platform-icon";
import FadeIn from "@/components/ui/fade-in";

// Static marketing page — middleware sends signed-in users to /dashboard.

const features = [
  {
    icon: PenSquare,
    title: "One composer, every platform",
    body: "Write your post once — Postr formats and publishes it to X, Facebook, Instagram and LinkedIn in one click, with live character counters for each platform.",
  },
  {
    icon: RotateCcw,
    title: "See every result, retry any failure",
    body: "Each platform reports back individually. If one post fails, you see exactly why and retry it alone — the rest of your posts are already live.",
  },
  {
    icon: ShieldCheck,
    title: "Your accounts stay yours",
    body: "You connect through each platform's official login. Access tokens are stored server-side, never in your browser, and you can disconnect any time.",
  },
  {
    icon: Zap,
    title: "Built light and fast",
    body: "Postr is lean by design — quick to load, easy on data, and made for posting on the move from any phone or laptop.",
  },
];

const steps = [
  {
    n: "01",
    title: "Connect your accounts",
    body: "Link X, Facebook, Instagram and LinkedIn with their official sign-in. Two minutes, once.",
  },
  {
    n: "02",
    title: "Write your post",
    body: "One text box, an optional photo, and chips to pick where it goes.",
  },
  {
    n: "03",
    title: "Publish everywhere",
    body: "One click. Every platform. Per-platform receipts in your history.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-screen-xl items-center justify-between p-4 md:px-8 md:py-6">
        <div className="flex items-center gap-3">
          <Feather size={20} strokeWidth={1.5} className="text-primary" />
          <span className="font-serif text-2xl">Postr</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded px-4 py-2 text-sm text-white/55 transition-colors duration-150 ease-out hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-screen-xl px-4 pb-16 pt-12 text-center md:px-8 md:pb-24 md:pt-20">
        <FadeIn>
          <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Post once.
            <br />
            <span className="text-primary">Publish everywhere.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
            One composer for X, Facebook, Instagram and LinkedIn. Write it
            once, hit publish, and your post goes everywhere your customers
            are — with a receipt for every platform.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="w-full rounded bg-primary px-8 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover sm:w-auto"
            >
              Start posting free
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded border border-white/10 px-8 py-3 text-sm text-white transition-colors duration-150 ease-out hover:bg-white/5 sm:w-auto"
            >
              How it works
            </a>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6">
            {PLATFORMS.map((p) => (
              <span key={p} title={PLATFORM_LABELS[p]} className="text-white/55">
                <PlatformIcon platform={p} size={22} className="text-inherit" />
              </span>
            ))}
          </div>
        </FadeIn>

        {/* Composer mock */}
        <FadeIn delay={0.1} className="mx-auto mt-14 max-w-2xl text-left">
          <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 shadow-none">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-2 rounded-full border border-primary bg-primary/15 px-4 py-1.5 text-xs">
                <PlatformIcon platform="x" size={14} /> X (Twitter)
              </span>
              <span className="flex items-center gap-2 rounded-full border border-primary bg-primary/15 px-4 py-1.5 text-xs">
                <PlatformIcon platform="instagram" size={14} /> Instagram
              </span>
              <span className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/55">
                <PlatformIcon platform="facebook" size={14} className="text-inherit" /> Facebook
              </span>
              <span className="flex items-center gap-2 rounded-full border border-primary bg-primary/15 px-4 py-1.5 text-xs">
                <PlatformIcon platform="linkedin" size={14} /> LinkedIn
              </span>
            </div>
            <div className="mt-4 rounded border border-white/10 p-4 text-sm leading-relaxed text-white/90">
              New stock just landed 🔥 Limited pieces — send a DM to order.
              Nationwide delivery. 🚚
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs tabular-nums text-white/55">
              <span className="flex items-center gap-1.5">
                <PlatformIcon platform="x" size={12} className="text-inherit" /> 89/280
              </span>
              <span className="flex items-center gap-1.5">
                <PlatformIcon platform="instagram" size={12} className="text-inherit" /> 89/2200
              </span>
              <span className="flex items-center gap-1.5">
                <PlatformIcon platform="linkedin" size={12} className="text-inherit" /> 89/3000
              </span>
              <span className="ml-auto rounded bg-primary px-4 py-1.5 text-xs font-medium text-white">
                Publish
              </span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8">
        <h2 className="text-center font-serif text-3xl md:text-4xl">
          Everything you need. Nothing you don&apos;t.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-6"
            >
              <Icon size={20} strokeWidth={1.5} className="text-primary" />
              <h3 className="mt-4 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8"
      >
        <h2 className="text-center font-serif text-3xl md:text-4xl">
          Live in three steps
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ n, title, body }) => (
            <div key={n} className="rounded-xl border border-white/10 p-6">
              <span className="font-serif text-3xl text-primary">{n}</span>
              <h3 className="mt-3 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8">
        <div className="rounded-xl border border-white/10 bg-zinc-900/50 px-6 py-12 text-center md:py-16">
          <h2 className="font-serif text-3xl md:text-5xl">
            Your customers are on every platform.
            <br />
            Now you are too.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/55 md:text-base">
            Free to start. Connect one account or all four — your first post is
            two minutes away.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded bg-primary px-8 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-screen-xl flex-col items-center justify-between gap-4 border-t border-white/5 px-4 py-8 sm:flex-row md:px-8">
        <div className="flex items-center gap-2 text-sm text-white/55">
          <Feather size={16} strokeWidth={1.5} className="text-primary" />
          Postr — post once, publish everywhere.
        </div>
        <div className="flex items-center gap-4">
          {PLATFORMS.map((p) => (
            <PlatformIcon key={p} platform={p} size={16} className="text-white/55" />
          ))}
        </div>
      </footer>
    </main>
  );
}
