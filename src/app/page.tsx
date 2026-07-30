import Link from "next/link";
import {
  Feather,
  ShieldCheck,
  Zap,
  RotateCcw,
  PenSquare,
  Store,
  Clapperboard,
  Briefcase,
  X as XMark,
  Check,
} from "lucide-react";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/platforms/types";
import PlatformIcon from "@/components/platform-icon";
import FadeIn from "@/components/ui/fade-in";
import LandingDemo from "@/components/landing-demo";

// Static marketing page — middleware sends signed-in users to /dashboard.

const oldWay = [
  "Open X. Type the post. Post it.",
  "Open Instagram. Retype the caption. Post again.",
  "Open Facebook. Copy-paste. Fix the formatting.",
  "Open LinkedIn… you know what, forget LinkedIn.",
];

const newWay = [
  "Type your post once.",
  "Pick your platforms.",
  "Hit publish.",
  "Get a receipt from every platform. Done in 30 seconds.",
];

const features = [
  {
    icon: PenSquare,
    title: "One composer, every platform",
    body: "Live character counters for each platform, photo upload, platform chips. Write like you talk — Postr handles the rest.",
  },
  {
    icon: RotateCcw,
    title: "Receipts, not guesswork",
    body: "Every platform reports back: posted or failed, with the exact reason. One failed? Retry just that one. The rest are already live.",
  },
  {
    icon: ShieldCheck,
    title: "Your accounts stay yours",
    body: "Connect through each platform's official login. We never see your password, and you can disconnect any time.",
  },
  {
    icon: Zap,
    title: "Light on data, fast on 3G",
    body: "Built lean on purpose. Pages load fast, your data lasts longer, and posting works even on a bad network day.",
  },
];

const personas = [
  {
    icon: Store,
    title: "Vendors",
    body: "Your post is your shop window. Put today's stock in front of every customer, on every app, before your competitor finishes typing.",
  },
  {
    icon: Clapperboard,
    title: "Creators",
    body: "Your audience is split across four apps. Your content shouldn't be four times the work. Post once, be everywhere your fans are.",
  },
  {
    icon: Briefcase,
    title: "Social managers",
    body: "Stop juggling logins. One dashboard, every client post published and verified — with proof to show for it.",
  },
];

function Marquee() {
  const items = [
    "ONE POST",
    "→",
    ...PLATFORMS.map((p) => PLATFORM_LABELS[p].toUpperCase()),
    "→",
    "EVERY CUSTOMER",
    "✦",
  ];
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((item, i) => (
        <span
          key={i}
          className="whitespace-nowrap font-serif text-lg tracking-wide text-white/40"
        >
          {item}
        </span>
      ))}
    </div>
  );
  return (
    <div className="relative overflow-hidden border-y border-white/5 py-4">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-onyx">
      {/* Aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] animate-aurora rounded-full bg-primary/25 blur-3xl motion-reduce:animate-none" />
        <div className="absolute -right-32 top-64 h-[420px] w-[420px] animate-aurora-slow rounded-full bg-[#1D9E75]/15 blur-3xl motion-reduce:animate-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-onyx/60 to-onyx" />
      </div>

      <div className="relative">
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
        <section className="mx-auto w-full max-w-screen-xl px-4 pb-16 pt-10 text-center md:px-8 md:pb-20 md:pt-16">
          <FadeIn>
            <p className="mx-auto mb-6 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-white/55">
              For sellers, creators &amp; everyone with something to say
            </p>
            <h1 className="mx-auto max-w-4xl font-serif text-[2.75rem] leading-[1.05] md:text-8xl">
              Stop posting
              <br />
              <span className="italic text-white/40 line-through decoration-danger/70 decoration-2">
                four times.
              </span>{" "}
              <span className="bg-gradient-to-r from-[#8b7ff0] via-primary to-[#1D9E75] bg-clip-text text-transparent">
                Post once.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
              Postr publishes to X, Instagram, Facebook and LinkedIn at the
              same time. One composer, one click, a receipt from every
              platform — so you can get back to business.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="w-full rounded bg-primary px-8 py-3.5 text-sm font-medium text-white transition-all duration-150 ease-out hover:scale-[1.02] hover:bg-primary-hover sm:w-auto"
              >
                Start posting free →
              </Link>
              <a
                href="#demo"
                className="w-full rounded border border-white/10 px-8 py-3.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-white/5 sm:w-auto"
              >
                Watch it work
              </a>
            </div>
            <p className="mt-4 text-xs text-white/40">
              Free to start · No card required · 2-minute setup
            </p>
          </FadeIn>

          {/* Live demo */}
          <FadeIn delay={0.1} className="mx-auto mt-14 max-w-2xl" >
            <div id="demo" className="scroll-mt-24">
              <LandingDemo />
            </div>
          </FadeIn>
        </section>

        <Marquee />

        {/* Old way vs Postr way */}
        <section className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8 md:py-20">
          <h2 className="text-center font-serif text-3xl md:text-5xl">
            30 minutes of copy-paste,
            <br />
            <span className="text-primary">or 30 seconds of Postr.</span>
          </h2>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
              <p className="font-serif text-xl text-white/55">The old way</p>
              <ul className="mt-4 space-y-3">
                {oldWay.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-white/55">
                    <XMark size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
              <p className="font-serif text-xl">The Postr way</p>
              <ul className="mt-4 space-y-3">
                {newWay.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm">
                    <Check size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-success" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8">
          <h2 className="text-center font-serif text-3xl md:text-5xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-xl border border-white/10 bg-zinc-900/50 p-6 transition-colors duration-150 hover:border-primary/40"
              >
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="text-primary transition-transform duration-150 group-hover:scale-110"
                />
                <h3 className="mt-4 font-serif text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Personas */}
        <section className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8">
          <h2 className="text-center font-serif text-3xl md:text-5xl">
            Built for people who <span className="italic">sell</span> on social.
          </h2>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {personas.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-white/10 p-6">
                <Icon size={22} strokeWidth={1.5} className="text-primary" />
                <h3 className="mt-4 font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-screen-xl px-4 py-16 md:px-8 md:pb-24">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 px-6 py-14 text-center md:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative">
              <h2 className="font-serif text-3xl md:text-6xl">
                Your next customer is scrolling
                <br />
                <span className="text-primary">right now.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/55 md:text-base">
                Be on every platform they check — without doing the work four
                times. Your first post is two minutes away.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-block rounded bg-primary px-10 py-3.5 text-sm font-medium text-white transition-all duration-150 ease-out hover:scale-[1.02] hover:bg-primary-hover"
              >
                Create your free account →
              </Link>
              <p className="mt-4 text-xs text-white/40">
                No card. No commitment. Just your post, everywhere.
              </p>
            </div>
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
      </div>
    </main>
  );
}
