"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative floating-glass rounded-[2rem] p-8 shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${variant === "danger" ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-[20px] font-bold text-on-surface mb-2">{title}</h3>
          {message && <p className="text-on-surface-variant/60 text-body-md mb-6">{message}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-white/60 bg-white/30 text-on-surface font-bold hover:bg-white/50 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl font-bold text-white transition-all ${
              variant === "danger"
                ? "bg-error shadow-lg shadow-error/20 hover:shadow-error/30"
                : "bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
