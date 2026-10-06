"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Timer, Clock, TrendingUp, DollarSign, Plus, Loader2 } from "lucide-react";
import { PageHeader, StatCard, DataTable, StatusBadge, EmptyState, FormDialog, FormInput } from "@intilaqa/ui";

type RecordItem = {
  id: string; date: string; regularHours: number; workedHours: number; overtimeHours: number;
  hours: number; rate: number; status: string; approvalStatus: string; notes: string | null;
  employeeName: string; employeeCode: string;
};

type Props = { locale: string; companyId: string; records: RecordItem[] };

export function OvertimeContent({ locale, companyId, records }: Props) {
  const t = useTranslations("nav");
  const to = useTranslations("overtime");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [localRecords, setLocalRecords] = useState(records);
  const [saving, setSaving] = useState(false);

  const totalOvertimeHours = records.reduce((s, r) => s + r.overtimeHours, 0);
  const pendingRecords = records.filter((r) => r.approvalStatus === "pending").length;
  const totalApproved = records.filter((r) => r.approvalStatus === "approved").length;

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch("/api/v1/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          employeeId: fd.get("employeeId"),
          date: fd.get("date"),
          hours: parseFloat(fd.get("hours") as string),
          rate: parseFloat(fd.get("rate") as string) || 1.5,
          notes: fd.get("notes") || null,
        }),
      });
      setShowCreateDialog(false);
    } catch {} finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title={t("items.overtime")} breadcrumbs={[{ label: t("items.dashboard"), href: `/${locale}/company` }, { label: t("items.overtime") }]}
        actions={<button onClick={() => setShowCreateDialog(true)} className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"><Plus className="w-4 h-4" />{to("new")}</button>} />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title={to("totalOvertimeHours")} value={`${totalOvertimeHours.toFixed(1)}h`} icon={Timer} variant="primary" />
        <StatCard title={to("pendingApproval")} value={pendingRecords} icon={Clock} variant={pendingRecords > 0 ? "error" : "secondary"} />
        <StatCard title={to("approved")} value={totalApproved} icon={TrendingUp} variant="secondary" />
        <StatCard title={to("totalRecords")} value={records.length} icon={DollarSign} variant="neutral" />
      </div>
      <div className="floating-glass rounded-[2rem] p-6">
        {localRecords.length === 0 ? (
          <EmptyState icon={<Timer className="w-10 h-10" />} title={to("noRecords")} description={to("noRecordsDesc")} />
        ) : (
          <DataTable
            columns={[
              { key: "employee", header: to("employee"), render: (item: RecordItem) => (<div><p className="text-on-surface text-[14px] font-bold">{item.employeeName}</p><p className="text-on-surface-variant/50 text-[11px]">{item.employeeCode}</p></div>) },
              { key: "date", header: to("date"), render: (item: RecordItem) => (<span className="text-on-surface-variant/70 text-[13px]">{new Date(item.date).toLocaleDateString()}</span>) },
              { key: "regular", header: to("regular"), render: (item: RecordItem) => (<span className="text-on-surface-variant/70 text-[13px]">{item.regularHours}h</span>) },
              { key: "worked", header: to("worked"), render: (item: RecordItem) => (<span className="text-on-surface-variant/70 text-[13px]">{item.workedHours}h</span>) },
              { key: "overtime", header: to("overtime"), render: (item: RecordItem) => (<span className="text-primary text-[14px] font-bold">{item.overtimeHours}h</span>) },
              { key: "rate", header: to("rate"), render: (item: RecordItem) => (<span className="text-on-surface-variant/70 text-[13px]">x{item.rate}</span>) },
              { key: "status", header: to("status"), render: (item: RecordItem) => <StatusBadge status={item.approvalStatus} /> },
            ]}
            data={localRecords}
            emptyTitle={to("noRecords")}
            emptyDescription={to("noRecordsDesc")}
          />
        )}
      </div>
      <FormDialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} title={to("new")}>
        <form onSubmit={handleCreate} className="space-y-4">
          <FormInput name="employeeId" label={to("employee")} required />
          <FormInput name="date" label={to("date")} type="date" required />
          <FormInput name="hours" label={to("overtime")} type="number" step="0.5" required />
          <FormInput name="rate" label={to("rate")} type="number" step="0.1" defaultValue="1.5" />
          <FormInput name="notes" label={to("status")} />
          <button type="submit" disabled={saving} className="w-full px-5 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{to("new")}
          </button>
        </form>
      </FormDialog>
    </div>
  );
}
