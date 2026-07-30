"use client";

import { useEffect, useState } from "react";
import { Check, Send } from "lucide-react";
import { PLATFORMS, PLATFORM_LABELS, CHAR_LIMITS } from "@/lib/platforms/types";
import PlatformIcon from "@/components/platform-icon";
import { cn } from "@/lib/utils";

const MESSAGE =
  "New stock just landed 🔥 Limited pieces — DM to order. Nationwide delivery 🚚";

// Self-playing product demo: types the post, presses publish, then pops in
// a receipt per platform. Loops forever; renders the finished state for
// users who prefer reduced motion.
export default function LandingDemo() {
  const [typed, setTyped] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [results, setResults] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(MESSAGE.length);
      setResults(PLATFORMS.length);
      return;
    }
    let alive = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (alive) {
        setTyped(0);
        setResults(0);
        await sleep(700);
        for (let i = 1; i <= MESSAGE.length && alive; i++) {
          setTyped(i);
          await sleep(26);
        }
        await sleep(500);
        if (!alive) break;
        setPressing(true);
        await sleep(220);
        setPressing(false);
        for (let i = 1; i <= PLATFORMS.length && alive; i++) {
          await sleep(420);
          setResults(i);
        }
        await sleep(3200);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const text = MESSAGE.slice(0, typed);
  const done = results >= PLATFORMS.length;

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-5 text-left backdrop-blur-sm md:p-6">
      {/* Selected platform chips */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <span
            key={p}
            className="flex items-center gap-2 rounded-full border border-primary/60 bg-primary/15 px-3 py-1.5 text-xs"
          >
            <PlatformIcon platform={p} size={13} />
            {PLATFORM_LABELS[p]}
          </span>
        ))}
      </div>

      {/* Typing area */}
      <div className="mt-4 min-h-[72px] rounded border border-white/10 p-4 text-sm leading-relaxed">
        {text}
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-caret bg-primary" />
      </div>

      {/* Counters + publish */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs tabular-nums text-white/55">
        <span className="flex items-center gap-1.5">
          <PlatformIcon platform="x" size={12} className="text-inherit" />
          {typed}/{CHAR_LIMITS.x}
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <PlatformIcon platform="instagram" size={12} className="text-inherit" />
          {typed}/{CHAR_LIMITS.instagram}
        </span>
        <span
          className={cn(
            "ml-auto flex items-center gap-2 rounded bg-primary px-4 py-1.5 text-xs font-medium text-white transition-transform duration-150",
            pressing && "scale-90"
          )}
        >
          <Send size={12} strokeWidth={1.5} />
          Publish
        </span>
      </div>

      {/* Receipts */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4 sm:grid-cols-4">
        {PLATFORMS.map((p, i) => (
          <div
            key={p}
            className={cn(
              "flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs",
              i < results ? "animate-pop" : "invisible"
            )}
          >
            <PlatformIcon platform={p} size={14} className="text-white/55" />
            <span className="flex items-center gap-1 text-success">
              <Check size={12} strokeWidth={2.5} /> Posted
            </span>
          </div>
        ))}
      </div>

      <p
        className={cn(
          "mt-3 text-center text-xs text-white/55 transition-opacity duration-300",
          done ? "opacity-100" : "opacity-0"
        )}
      >
        4 platforms. One click. 30 seconds.
      </p>
    </div>
  );
}
