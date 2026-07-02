"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import Button from "@/components/ui/button";

export default function RetryButton({ resultId }: { resultId: string }) {
  const router = useRouter();

  const retry = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Retry failed");
      return json;
    },
    onSuccess: () => {
      toast.success("Published successfully");
      router.refresh();
    },
    onError: (e: Error) => {
      toast.error(e.message);
      router.refresh();
    },
  });

  return (
    <Button
      variant="secondary"
      loading={retry.isPending}
      onClick={() => retry.mutate()}
    >
      <RotateCcw size={14} strokeWidth={1.5} />
      Retry
    </Button>
  );
}
