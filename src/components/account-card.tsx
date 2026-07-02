"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type Platform, PLATFORM_LABELS } from "@/lib/platforms/types";
import { formatDate } from "@/lib/utils";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PlatformIcon from "@/components/platform-icon";

export default function AccountCard({
  platform,
  accountName,
  connectedAt,
}: {
  platform: Platform;
  accountName: string | null;
  connectedAt: string | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const connected = accountName !== null;

  async function disconnect() {
    setBusy(true);
    const res = await fetch("/api/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    });
    setBusy(false);
    setConfirming(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error ?? "Could not disconnect");
      return;
    }
    toast.success(`${PLATFORM_LABELS[platform]} disconnected`);
    router.refresh();
  }

  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10">
          <PlatformIcon platform={platform} />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{PLATFORM_LABELS[platform]}</p>
          <p className="truncate text-sm text-white/55">
            {connected
              ? `${accountName} · since ${formatDate(connectedAt!)}`
              : "Not connected"}
          </p>
        </div>
      </div>

      {connected ? (
        <Button variant="secondary" onClick={() => setConfirming(true)}>
          Disconnect
        </Button>
      ) : (
        <a href={`/api/connect/${platform}`}>
          <Button>Connect</Button>
        </a>
      )}

      <ConfirmDialog
        open={confirming}
        title={`Disconnect ${PLATFORM_LABELS[platform]}?`}
        description="Postr will no longer be able to publish to this account. Your post history is kept."
        confirmLabel="Disconnect"
        loading={busy}
        onConfirm={disconnect}
        onClose={() => setConfirming(false)}
      />
    </Card>
  );
}
