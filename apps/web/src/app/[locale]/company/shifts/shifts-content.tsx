"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Plus, RefreshCw, UserPlus, Trash2, Loader2 } from "lucide-react";
import { PageHeader, DataTable, StatusBadge, EmptyState, FormSection, FormDialog, FormSelect } from "@intilaqa/ui";

type ShiftItem = {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  workingDays: number;
  breakMinutes: number;
  isActive: boolean;
};

type ShiftAssignment = {
  id: string;
  shiftName: string;
  employeeName: string;
  employeeId: string;
  shiftId: string;
  startDate: string;
  endDate: string | null;
};

type EmployeeOption = { id: string; name: string };

type Props = {
  locale: string;
  companyId: string;
  shifts: ShiftItem[];
  assignments: ShiftAssignment[];
  employees: EmployeeOption[];
};

export function ShiftsContent({ locale, companyId, shifts, assignments, employees }: Props) {
  const t = useTranslations("nav");
  const ts = useTranslations("shifts");
  const tc = useTranslations("common");

  const shiftTypeColors: Record<string, { label: string; color: string }> = {
    fixed: { label: ts("fixed"), color: "bg-primary/10 text-primary border-primary/10" },
    variable: { label: ts("variable"), color: "bg-secondary/10 text-secondary border-secondary/10" },
    night: { label: ts("night"), color: "bg-on-surface-variant/10 text-on-surface-variant border-white/20" },
    seasonal: { label: ts("seasonal"), color: "bg-error/10 text-error border-error/10" },
  };
  const [tab, setTab] = useState<"shifts" | "assignments">("shifts");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [localShifts, setLocalShifts] = useState(shifts);
  const [localAssignments, setLocalAssignments] = useState(assignments);
  const [form, setForm] = useState({ name: "", type: "fixed", startTime: "08:00", endTime: "17:00", workingDays: 5, breakMinutes: 60 });
  const [assignForm, setAssignForm] = useState({ employeeIds: [] as string[], shiftId: "", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, companyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLocalShifts((prev) => [...prev, data.shift]);
        setShowCreateDialog(false);
        setForm({ name: "", type: "fixed", startTime: "08:00", endTime: "17:00", workingDays: 5, breakMinutes: 60 });
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (assignForm.employeeIds.length === 0 || !assignForm.shiftId || !assignForm.startDate) return;
    setSaving(true);
    try {
      const newAssignments: ShiftAssignment[] = [];
      for (const employeeId of assignForm.employeeIds) {
        const res = await fetch("/api/v1/shifts/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId, shiftId: assignForm.shiftId, startDate: assignForm.startDate, endDate: assignForm.endDate || null }),
        });
        if (res.ok) {
          const data = await res.json();
          newAssignments.push(data.assignment);
        }
      }
      setLocalAssignments((p) => [...p, ...newAssignments]);
      setShowAssignDialog(false);
      setAssignForm({ employeeIds: [], shiftId: "", startDate: "", endDate: "" });
    } catch { /* silently fail */ } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title={t("items.shifts")}
        breadcrumbs={[
          { label: t("items.dashboard"), href: `/${locale}/company` },
          { label: t("items.shifts") },
        ]}
        actions={
          <div className="flex gap-2">
            {tab === "assignments" && (
              <button
                onClick={() => setShowAssignDialog(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <UserPlus className="w-4 h-4" />
                {ts("assign")}
              </button>
            )}
            {tab === "shifts" && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                {ts("newShift")}
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["shifts", "assignments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all ${
              tab === t ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/30 border border-outline-variant/40 text-on-surface hover:bg-white/50"
            }`}
          >
            {t === "shifts" ? ts("shiftsTab") : ts("assignmentsTab")}
          </button>
        ))}
      </div>

      {/* Shifts Tab */}
      {tab === "shifts" && (
        <div className="floating-glass rounded-[2rem] p-6">
          {localShifts.length === 0 ? (
            <EmptyState icon={<Clock className="w-10 h-10" />} title={ts("noShifts")} description={ts("noShiftsDesc")} />
          ) : (
            <DataTable
              columns={[
                { key: "name", header: ts("shiftName"), render: (item: ShiftItem) => (<span className="text-on-surface text-[14px] font-bold">{item.name}</span>) },
                { key: "type", header: ts("type"), render: (item: ShiftItem) => { const style = shiftTypeColors[item.type] ?? shiftTypeColors.fixed; return (<span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${style!.color}`}>{style!.label}</span>); } },
                { key: "time", header: ts("time"), render: (item: ShiftItem) => (<span className="text-on-surface-variant/70 text-[13px] font-mono">{item.startTime} — {item.endTime}</span>) },
                { key: "workingDays", header: ts("workingDays"), render: (item: ShiftItem) => (<span className="text-on-surface-variant/70 text-[13px]">{item.workingDays} {ts("days")}</span>) },
                { key: "break", header: ts("break"), render: (item: ShiftItem) => (<span className="text-on-surface-variant/70 text-[13px]">{item.breakMinutes} {ts("min")}</span>) },
                { key: "status", header: ts("status"), render: (item: ShiftItem) => (<StatusBadge status={item.isActive ? "active" : "inactive"} />) },
              ]}
              data={localShifts}
              emptyTitle={ts("noShifts")}
              emptyDescription={ts("noShiftsDesc")}
            />
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {tab === "assignments" && (
        <div className="floating-glass rounded-[2rem] p-6">
          {localAssignments.length === 0 ? (
            <EmptyState icon={<UserPlus className="w-10 h-10" />} title={ts("noAssignments")} description={ts("assignDesc")} />
          ) : (
            <DataTable
              columns={[
                { key: "employee", header: ts("employee"), render: (a: ShiftAssignment) => (<span className="text-on-surface text-[14px] font-bold">{a.employeeName}</span>) },
                { key: "shift", header: ts("shift"), render: (a: ShiftAssignment) => (<span className="text-primary text-[13px] font-bold">{a.shiftName}</span>) },
                { key: "start", header: ts("startDate"), render: (a: ShiftAssignment) => (<span className="text-[12px]">{new Date(a.startDate).toLocaleDateString()}</span>) },
                { key: "end", header: ts("endDate"), render: (a: ShiftAssignment) => (<span className="text-[12px]">{a.endDate ? new Date(a.endDate).toLocaleDateString() : ts("ongoing")}</span>) },
                { key: "actions", header: "", render: (a: ShiftAssignment) => (
                  <button onClick={async () => { await fetch(`/api/v1/shifts/assignments?id=${a.id}`, { method: "DELETE" }); setLocalAssignments((p) => p.filter((x) => x.id !== a.id)); }} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                ) },
              ]}
              data={localAssignments}
              emptyTitle={ts("noAssignments")}
              emptyDescription={ts("assignDesc")}
            />
          )}
        </div>
      )}

      <FormDialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)} title={ts("assignShift")}>
        <div className="space-y-4">
          <label className="block text-on-surface-variant/60 text-[11px] font-bold uppercase tracking-wider mb-1.5">{ts("employees")}</label>
          <div className="max-h-40 overflow-y-auto space-y-1 border border-outline-variant/60 rounded-xl p-2 bg-white/20">
            {employees.map((e) => (
              <label key={e.id} className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/30 cursor-pointer text-[13px]">
                <input
                  type="checkbox"
                  checked={assignForm.employeeIds.includes(e.id)}
                  onChange={(ev) => {
                    setAssignForm((prev) => ({
                      ...prev,
                      employeeIds: ev.target.checked
                        ? [...prev.employeeIds, e.id]
                        : prev.employeeIds.filter((id) => id !== e.id),
                    }));
                  }}
                  className="w-4 h-4 rounded"
                />
                {e.name}
              </label>
            ))}
          </div>
          <FormSelect name="shiftId" label={ts("shift")} options={localShifts.map((s) => ({ value: s.id, label: `${s.name} (${s.startTime}-${s.endTime})` }))} value={assignForm.shiftId} onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-on-surface-variant/60 text-[11px] font-bold uppercase tracking-wider mb-1.5">{ts("startDate")}</label>
              <input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-on-surface-variant/60 text-[11px] font-bold uppercase tracking-wider mb-1.5">{ts("endDate")}</label>
              <input type="date" value={assignForm.endDate} onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-outline-variant/60 text-on-surface text-[13px] focus:outline-none focus:border-primary" />
            </div>
          </div>
          <button onClick={handleAssign} disabled={saving} className="w-full px-5 py-3 rounded-xl bg-primary text-white text-[13px] font-bold shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {ts("assignEmployee")}
          </button>
        </div>
      </FormDialog>
    </div>
  );
}
