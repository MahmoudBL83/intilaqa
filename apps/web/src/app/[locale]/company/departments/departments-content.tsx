"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
import { PageHeader, FormDialog, FormInput } from "@intilaqa/ui";

type Dept = { id: string; name: string; employeeCount: number };

export function DepartmentsContent({ departments }: { departments: Dept[] }) {
  const t = useTranslations("departments");
  const router = useRouter();
  const locale = useLocale();
  const tc = useTranslations("common");
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch("/api/v1/departments", {
        method: "POST",
        body: JSON.stringify({ name: fd.get("name") }),
        headers: { "Content-Type": "application/json" },
      });
      router.refresh();
      setShowDialog(false);
    } catch {} finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/v1/departments?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: tc("dashboard"), href: `/${locale}/company` }, { label: t("title") }]}
        actions={<button onClick={() => setShowDialog(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold"><Plus className="w-4 h-4" />{t("addDepartment")}</button>} />
      <div className="floating-glass rounded-[2rem] p-6">
        {departments.length === 0 ? (
          <div className="py-12 text-center"><Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-on-surface-variant/50">{t("noDepartments")}</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase">{t("name")}</th>
                <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase">{t("employees")}</th>
                <th className="text-center px-3 py-2.5 font-semibold text-gray-700 text-[11px] uppercase">{t("actions")}</th>
              </tr></thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="px-3 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-3 py-3 text-center font-bold">{d.employeeCount}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <FormDialog open={showDialog} onClose={() => setShowDialog(false)} title={t("addDepartment")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput name="name" label={t("departmentName")} required />
          <button type="submit" disabled={saving} className="w-full px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{t("create")}
          </button>
        </form>
      </FormDialog>
    </div>
  );
}
