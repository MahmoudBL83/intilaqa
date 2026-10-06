"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

type FormDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormDialog({ open, onClose, title, description, children, className }: FormDialogProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg floating-glass rounded-[2.5rem] p-8 shadow-xl animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-on-surface">{title}</h2>
            {description && (
              <p className="text-on-surface-variant/60 text-[13px] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/30 border border-outline-variant/40 flex items-center justify-center text-on-surface-variant/60 hover:bg-white/50 hover:text-on-surface transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
