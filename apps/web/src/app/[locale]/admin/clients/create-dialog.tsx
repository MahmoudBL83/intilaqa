"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { FormDialog } from "@intilaqa/ui";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { quickCreateClientAction } from "./actions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreateClientDialog({ open, onClose }: Props) {
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await quickCreateClientAction(formData);

    if (result.success) {
      router.refresh();
      onClose();
    } else {
      setError(result.error || tc("unknownError"));
      setLoading(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={t("addClient")}
      description={t("addClientDescription", { fallback: "Create a new client account with a user login" })}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-3 p-3 bg-error/10 text-error rounded-2xl border border-error/10">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-[13px] font-medium">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[13px] font-bold text-on-surface mb-1.5">
            {t("name")} <span className="text-error">*</span>
          </label>
          <input
            name="name"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="Acme Corp"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-on-surface mb-1.5">
            {t("domain")}
          </label>
          <input
            name="domain"
            className="w-full px-4 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="acme.com"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-on-surface mb-1.5">
            {t("contactEmail") || "Contact Email"} <span className="text-error">*</span>
          </label>
          <input
            name="contactEmail"
            type="email"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="admin@acme.com"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-on-surface mb-1.5">
            {tc("password")} <span className="text-error">*</span>
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="********"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? tc("loading") : tc("create")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/60 transition-all"
          >
            {tc("cancel")}
          </button>
        </div>
      </form>
    </FormDialog>
  );
}
