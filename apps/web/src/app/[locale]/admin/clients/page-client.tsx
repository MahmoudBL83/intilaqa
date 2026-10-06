"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Download } from "lucide-react";
import { CreateClientDialog } from "./create-dialog";

export function ClientsPageActions() {
  const t = useTranslations("clients");
  const td = useTranslations("dashboard");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-xl border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/60 hover:scale-[1.02] transition-all flex items-center gap-2">
        <Download className="w-4 h-4" />
        {td("exportData")}
      </button>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {t("addClient")}
      </button>
      <CreateClientDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
