"use client";

import { useTranslations, useLocale } from "next-intl";
import { PageHeader, DataTable, Pagination } from "@intilaqa/ui";
import { Shield, Activity, Eye, Edit3, Trash2, Plus } from "lucide-react";

type Log = { id: string; action: string; entityType: string; entityId: string; user: string; changes: string | null; ip: string | null; createdAt: string };

const actionConfig: Record<string, { color: string; icon: React.ElementType }> = {
  create: { color: "bg-emerald-50 text-emerald-700", icon: Plus },
  update: { color: "bg-blue-50 text-blue-700", icon: Edit3 },
  delete: { color: "bg-red-50 text-red-700", icon: Trash2 },
  view: { color: "bg-purple-50 text-purple-700", icon: Eye },
  login: { color: "bg-gray-50 text-gray-700", icon: Shield },
};

export function AdminAuditContent({
  logs, total, currentPage = 1, totalPages = 1,
}: {
  logs: Log[];
  total: number;
  currentPage?: number;
  totalPages?: number;
}) {
  const t = useTranslations("auditLog");
  const td = useTranslations("dashboard");
  const locale = useLocale();

  const createCount = logs.filter((l) => l.action === "create").length;
  const updateCount = logs.filter((l) => l.action === "update").length;
  const deleteCount = logs.filter((l) => l.action === "delete").length;

  return (
    <div>
      <PageHeader title={t("title")} subtitle={`${total} ${t("entries")}`} breadcrumbs={[{ label: td("overview"), href: `/${locale}/admin` }, { label: t("breadcrumb") }]} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-emerald-700/70 mb-1">{t("create") || "Created"}</p><p className="text-3xl font-bold text-emerald-900">{createCount}</p></div>
            <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center"><Plus className="w-5 h-5 text-emerald-700" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-blue-700/70 mb-1">{t("update") || "Updated"}</p><p className="text-3xl font-bold text-blue-900">{updateCount}</p></div>
            <div className="w-10 h-10 rounded-xl bg-blue-200/50 flex items-center justify-center"><Edit3 className="w-5 h-5 text-blue-700" /></div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-red-700/70 mb-1">{t("delete") || "Deleted"}</p><p className="text-3xl font-bold text-red-900">{deleteCount}</p></div>
            <div className="w-10 h-10 rounded-xl bg-red-200/50 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-700" /></div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
        <div className="p-6">
          <DataTable
            columns={[
              { key: "action", header: t("action"), render: (l: Log) => {
                const cfg = actionConfig[l.action] as typeof actionConfig[string] ?? actionConfig.view;
                const ActionIcon = cfg.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.color}`}>
                    <ActionIcon className="w-3.5 h-3.5" />
                    <span className="capitalize">{l.action}</span>
                  </span>
                );
              }},
              { key: "entity", header: t("entity"), render: (l: Log) => <span className="text-[12px] text-on-surface-variant/70">{l.entityType}: <span className="font-mono text-[11px]">{l.entityId.substring(0, 12)}...</span></span> },
              { key: "user", header: t("user"), render: (l: Log) => <span className="text-[13px] font-medium text-on-surface">{l.user}</span> },
              { key: "ip", header: t("ip"), render: (l: Log) => <span className="text-gray-400 text-[11px] font-mono">{l.ip || "—"}</span> },
              { key: "date", header: t("date"), render: (l: Log) => <span className="text-gray-500 text-[11px]">{new Date(l.createdAt).toLocaleString()}</span> },
            ]}
            data={logs}
            emptyTitle={t("noEntries")}
            emptyDescription={t("noEntriesDesc")}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
