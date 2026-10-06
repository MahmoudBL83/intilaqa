"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

export function DownloadButton({ id }: { id: string }) {
  const t = useTranslations("payslips");
  return (
    <a href={`/api/v1/payslips/download?id=${id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all">
      <Download className="w-3 h-3" />
      {t("download")}
    </a>
  );
}
