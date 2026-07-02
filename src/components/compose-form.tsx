"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ImagePlus, X as XIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useComposeStore } from "@/lib/store/compose";
import {
  CHAR_LIMITS,
  PLATFORM_LABELS,
  PLATFORMS,
  type Platform,
} from "@/lib/platforms/types";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import PlatformIcon from "@/components/platform-icon";

interface PublishResponse {
  postId: string;
  results: { platform: Platform; ok: boolean; error?: string }[];
}

function CharCounter({ platform, length }: { platform: Platform; length: number }) {
  const limit = CHAR_LIMITS[platform];
  const ratio = length / limit;
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-xs tabular-nums",
        ratio > 1
          ? "text-danger"
          : ratio >= 0.9
            ? "text-warning"
            : "text-white/55"
      )}
    >
      <PlatformIcon platform={platform} size={14} className="text-inherit" />
      {length}/{limit}
    </span>
  );
}

export default function ComposeForm({
  connectedPlatforms,
}: {
  connectedPlatforms: Platform[];
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);
  const {
    text,
    selectedPlatforms,
    mediaFile,
    mediaPreview,
    publishing,
    setText,
    togglePlatform,
    setMedia,
    setPublishing,
    reset,
  } = useComposeStore();

  const overLimit = selectedPlatforms.filter(
    (p) => text.length > CHAR_LIMITS[p]
  );
  const igWithoutMedia = selectedPlatforms.includes("instagram") && !mediaFile;
  const canPublish =
    selectedPlatforms.length > 0 &&
    (text.trim().length > 0 || mediaFile) &&
    overLimit.length === 0 &&
    !igWithoutMedia;

  const publish = useMutation({
    mutationFn: async (): Promise<PublishResponse> => {
      let mediaUrl: string | null = null;

      if (mediaFile) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const path = `${user!.id}/${Date.now()}-${mediaFile.name}`;
        const { error } = await supabase.storage
          .from("post-media")
          .upload(path, mediaFile);
        if (error) throw new Error(`Media upload failed: ${error.message}`);
        mediaUrl = supabase.storage.from("post-media").getPublicUrl(path)
          .data.publicUrl;
      }

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mediaUrl,
          platforms: selectedPlatforms,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      return json;
    },
    onMutate: () => setPublishing(true),
    onSettled: () => setPublishing(false),
    onSuccess: (data) => {
      setConfirming(false);
      const failed = data.results.filter((r) => !r.ok);
      if (failed.length === 0) {
        toast.success("Published to all platforms");
        reset();
      } else {
        toast.error(
          `Failed on ${failed.map((f) => PLATFORM_LABELS[f.platform]).join(", ")} — see details in History`
        );
      }
      router.push(`/history/${data.postId}`);
    },
    onError: (e: Error) => {
      setConfirming(false);
      toast.error(e.message);
    },
  });

  return (
    <>
      <Card className="space-y-6">
        {/* Platform chips */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => {
            const connected = connectedPlatforms.includes(platform);
            const selected = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                disabled={!connected}
                onClick={() => togglePlatform(platform)}
                title={connected ? undefined : "Not connected"}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-primary",
                  selected
                    ? "border-primary bg-primary/15 text-white"
                    : "border-white/10 text-white/55 hover:bg-white/5",
                  !connected && "cursor-not-allowed opacity-40"
                )}
              >
                <PlatformIcon platform={platform} size={16} className="text-inherit" />
                {PLATFORM_LABELS[platform]}
              </button>
            );
          })}
        </div>

        {connectedPlatforms.length === 0 && (
          <p className="text-sm text-warning">
            No accounts connected yet —{" "}
            <Link href="/accounts" className="underline hover:text-white">
              connect one
            </Link>{" "}
            to start publishing.
          </p>
        )}

        {/* Textarea */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you want to say?"
            rows={6}
            className="w-full resize-y rounded border border-white/10 bg-transparent p-4 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {(selectedPlatforms.length > 0 ? selectedPlatforms : PLATFORMS).map(
              (p) => (
                <CharCounter key={p} platform={p} length={text.length} />
              )
            )}
          </div>
        </div>

        {/* Media */}
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
          />
          {mediaPreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaPreview}
                alt="Upload preview"
                className="h-40 rounded-xl border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={() => setMedia(null)}
                className="absolute -right-2 -top-2 rounded-full border border-white/10 bg-surface p-1 text-white/55 transition-colors duration-150 hover:text-white"
                aria-label="Remove image"
              >
                <XIcon size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-8 text-sm text-white/55 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-white"
            >
              <ImagePlus size={20} strokeWidth={1.5} />
              Add an image
            </button>
          )}
          {igWithoutMedia && (
            <p className="mt-2 text-xs text-warning">
              Instagram requires an image — add one or deselect Instagram.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-6">
          <Button
            variant="secondary"
            onClick={reset}
            disabled={publishing || (!text && !mediaFile)}
          >
            Clear
          </Button>
          <Button onClick={() => setConfirming(true)} disabled={!canPublish}>
            <Send size={16} strokeWidth={1.5} />
            Publish
          </Button>
        </div>
      </Card>

      {/* Publish confirmation — backdrop is inert while in flight */}
      <Dialog
        open={confirming}
        onClose={publishing ? () => {} : () => setConfirming(false)}
        className="relative z-50"
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/70",
            publishing && "pointer-events-none"
          )}
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl border border-white/10 bg-surface p-6">
            <DialogTitle className="font-serif text-xl">
              Publish to {selectedPlatforms.length} platform
              {selectedPlatforms.length === 1 ? "" : "s"}?
            </DialogTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedPlatforms.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/55"
                >
                  <PlatformIcon platform={p} size={14} className="text-inherit" />
                  {PLATFORM_LABELS[p]}
                </span>
              ))}
            </div>
            <p className="mt-4 line-clamp-3 rounded border border-white/10 p-3 text-sm text-white/55">
              {text || "(media only)"}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirming(false)}
                disabled={publishing}
              >
                Cancel
              </Button>
              <Button onClick={() => publish.mutate()} loading={publishing}>
                Publish now
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
