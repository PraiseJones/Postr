"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Link2,
  History,
  Settings,
  LogOut,
  Feather,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/accounts", label: "Accounts", icon: Link2 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-onyx md:w-60">
      <div className="flex items-center gap-3 px-6 py-8">
        <Feather size={20} strokeWidth={1.5} className="text-primary" />
        <span className="font-serif text-2xl">Postr</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors duration-150 ease-out",
                active
                  ? "bg-white/5 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate px-2 text-xs text-white/55">{email}</p>
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-white/55 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-white"
        >
          <LogOut size={20} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
