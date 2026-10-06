"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";

type DetailDrawerProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function DetailDrawer({ open, title, children, onClose }: DetailDrawerProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex" style={{ justifyContent: isRtl ? "flex-start" : "flex-end" }}>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg floating-glass rounded-[2rem] m-2 sm:m-4 shadow-2xl overflow-y-auto"
        style={{
          animation: isRtl ? "slide-in-left 0.3s ease-out" : "slide-in-right 0.3s ease-out",
        }}
      >
        <div className="sticky top-0 floating-glass rounded-t-[2rem] border-b border-white/30 p-6 flex items-center justify-between z-10">
          {title && <h2 className="text-[20px] font-bold text-on-surface">{title}</h2>}
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/30 border border-outline-variant/40 flex items-center justify-center hover:bg-white/50 transition-all">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
