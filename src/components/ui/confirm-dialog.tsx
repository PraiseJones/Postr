"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Button from "./button";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? () => {} : onClose}
      className="relative z-50"
    >
      <div
        className={`fixed inset-0 bg-black/70 ${loading ? "pointer-events-none" : ""}`}
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-xl border border-white/10 bg-surface p-6">
          <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
          <p className="mt-2 text-sm text-white/55">{description}</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
