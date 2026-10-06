"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Webhook, Plus, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PageHeader, FormDialog, FormInput, Pagination } from "@intilaqa/ui";

type Delivery = { eventType: string; success: boolean; responseCode: number | null; createdAt: string };
type WebhookData = { id: string; name: string; url: string; events: string[]; isActive: boolean; deliveries: Delivery[] };

export function WebhooksContent({
  webhooks, currentPage = 1, totalPages = 1,
}: {
  webhooks: WebhookData[];
  currentPage?: number;
  totalPages?: number;
}) {
  const t = useTranslations("webhooks");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const events = (fd.get("events") as string).split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await fetch("/api/v1/webhooks", {
        method: "POST",
        body: JSON.stringify({ name: fd.get("name"), url: fd.get("url"), events }),
        headers: { "Content-Type": "application/json" },
      });
      router.refresh(); setShowDialog(false);
    } catch {} finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/v1/webhooks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("breadcrumb") }]}
        actions={<button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold"><Plus className="w-4 h-4" />{t("addWebhook")}</button>} />
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="floating-glass rounded-[2rem] p-12 text-center"><Webhook className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-on-surface-variant/50">{t("noWebhooks")}</p></div>
        ) : (
          webhooks.map((w) => (
            <div key={w.id} className="floating-glass rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-on-surface text-[15px]">{w.name}</h3>
                  <p className="text-on-surface-variant/50 text-[12px] font-mono">{w.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${w.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{w.isActive ? t("active") : t("inactive")}</span>
                  <button onClick={() => handleDelete(w.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex gap-2 mb-3">{w.events.map((e) => <span key={e} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{e}</span>)}</div>
              {w.deliveries.length > 0 && (
                <div className="border-t border-white/20 pt-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/50 mb-2">{t("recentDeliveries")}</p>
                  <div className="space-y-1">
                    {w.deliveries.map((d, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px]">
                        <span>{d.eventType}</span>
                        {d.success ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                        <span className="text-gray-400">{new Date(d.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
      <FormDialog open={showDialog} onClose={() => setShowDialog(false)} title={t("addWebhookTitle")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput name="name" label={t("name")} required />
          <FormInput name="url" label={t("url")} type="url" required placeholder="https://example.com/webhook" />
          <FormInput name="events" label={t("eventsLabel")} required placeholder={t("eventsPlaceholder")} />
          <button type="submit" disabled={saving} className="w-full px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("create")}
          </button>
        </form>
      </FormDialog>
    </div>
  );
}
