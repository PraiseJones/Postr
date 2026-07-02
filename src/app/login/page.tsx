"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Feather } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import FadeIn from "@/components/ui/fade-in";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) toast.error(error);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (mode === "signup") {
      toast.success("Check your email to confirm your account.");
      return;
    }
    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <FadeIn className="w-full max-w-sm">
      <div className="mb-10 flex items-center gap-3">
        <Feather size={24} strokeWidth={1.5} className="text-primary" />
        <span className="font-serif text-3xl">Postr</span>
      </div>

      <h1 className="font-serif text-4xl">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-white/55">
        Compose once. Publish to X, Facebook, Instagram and LinkedIn.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-white/55">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-white/10 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-white/55">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-white/10 bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          {mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-6 text-sm text-white/55 transition-colors duration-150 hover:text-white"
      >
        {mode === "signin"
          ? "No account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </FadeIn>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
