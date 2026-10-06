"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { FormDialog, FormInput, FormSelect, FormTextarea } from "@intilaqa/ui";
import { createEmployeeRequest } from "./actions";

export function NewRequestDialog() {
  const t = useTranslations("requests");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createEmployeeRequest(formData);

    if (result.success) {
      router.refresh();
      setOpen(false);
    } else {
      setError(result.error || tc("unknownError"));
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-bold hover:opacity-90 transition-all"
      >
        <Plus className="w-4 h-4" />
        {t("title")}
      </button>
      <FormDialog
        open={open}
        onClose={() => { setOpen(false); setError(""); }}
        title={t("title")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-error/10 text-error rounded-2xl border border-error/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[13px] font-medium">{error}</span>
            </div>
          )}

          <FormSelect
            name="type"
            label={t("type")}
            options={[
              { value: "leave", label: t("leave") },
              { value: "permission", label: t("permission") },
              { value: "overtime", label: t("overtime") },
              { value: "salary_letter", label: t("salaryLetter") },
              { value: "document", label: t("document") },
              { value: "other", label: t("other") },
            ]}
            required
          />
          <FormInput name="title" label={t("requestTitle")} required />
          <FormInput name="startDate" label={tc("startDate")} type="date" required />
          <FormInput name="endDate" label={tc("endDate")} type="date" />
          <FormTextarea name="description" label={tc("description")} />

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? tc("loading") : tc("save")}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(""); }}
              className="px-5 py-2.5 rounded-2xl bg-white/40 border border-outline-variant/60 text-on-surface text-[14px] font-bold hover:bg-white/60 transition-all"
            >
              {tc("cancel")}
            </button>
          </div>
        </form>
      </FormDialog>
    </>
  );
}
