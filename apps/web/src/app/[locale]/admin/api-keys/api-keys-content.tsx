"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Key, Plus, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { PageHeader, FormDialog, FormInput, Pagination } from "@intilaqa/ui";

type ApiKey = {
  id: string; name: string; prefix: string; clientName: string | null; companyName: string | null;
  permissions: string[]; isActive: boolean; lastUsedAt: string | null; expiresAt: string | null;
};

export function ApiKeysContent({
  keys, currentPage = 1, totalPages = 1,
}: {
  keys: ApiKey[];
  currentPage?: number;
  totalPages?: number;
}) {
  const t = useTranslations("apiKeys");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        body: JSON.stringify({ name: fd.get("name"), clientId: fd.get("clientId") || null, permissions: ["*"] }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setNewKey(data.data.key);
      router.refresh();
    } catch {} finally { setSaving(false); }
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/v1/api-keys?id=${id}`, { method: "PATCH", body: JSON.stringify({ isActive: false }), headers: { "Content-Type": "application/json" } });
    router.refresh();
  }

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("breadcrumb") }]}
        actions={<button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold"><Plus className="w-4 h-4" />{t("generateKey")}</button>} />
      {newKey && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-100 border border-emerald-300">
          <p className="font-bold text-emerald-800 text-[13px] mb-2">{t("keyGenerated")}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded-lg text-[11px] break-all font-mono">{newKey}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKey); setCopied(true); }} className="p-2 rounded-lg bg-emerald-600 text-white"><Copy className="w-4 h-4" /></button>
          </div>
          {copied && <p className="text-emerald-700 text-[12px] mt-1 flex items-center gap-1"><Check className="w-3 h-3" />{t("copied")}</p>}
        </div>
      )}
      <div className="floating-glass rounded-[2rem] p-6">
        {keys.length === 0 ? (
          <div className="py-12 text-center"><Key className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-on-surface-variant/50">{t("noKeys")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("name")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("prefix")}</th>
                <th className="text-left px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("scope")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("status")}</th>
                <th className="text-center px-3 py-2.5 text-[11px] uppercase font-semibold text-gray-700">{t("actions")}</th>
              </tr></thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-[13px]">{k.name}</td>
                    <td className="px-3 py-3 font-mono text-[12px] text-gray-500">{k.prefix}...</td>
                    <td className="px-3 py-3 text-[12px] text-gray-600">{k.clientName || k.companyName || t("global")}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${k.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{k.isActive ? t("active") : t("revoked")}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {k.isActive && <button onClick={() => handleRevoke(k.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
      <FormDialog open={showDialog} onClose={() => setShowDialog(false)} title={t("generateApiKey")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput name="name" label={t("keyName")} required />
          <button type="submit" disabled={saving} className="w-full px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("generate")}
          </button>
        </form>
      </FormDialog>
    </div>
  );
}
