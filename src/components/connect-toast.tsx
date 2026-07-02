"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PLATFORM_LABELS } from "@/lib/platforms/types";
import { isPlatform } from "@/lib/platforms/guards";

// Surfaces ?connected= / ?error= query params from the OAuth callback as
// toasts, then cleans the URL.
export default function ConnectToast() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (!connected && !error) return;

    if (connected && isPlatform(connected)) {
      toast.success(`${PLATFORM_LABELS[connected]} connected`);
    }
    if (error) toast.error(error);
    router.replace("/accounts");
  }, [searchParams, router]);

  return null;
}
