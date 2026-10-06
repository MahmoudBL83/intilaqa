"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, Calendar, LayoutGrid, Table2, CheckCircle, Clock, XCircle, Plane } from "lucide-react";
import { cn, KPICard } from "@intilaqa/ui";

type AttendanceRecord = {
  id: string;
  employeeName: string;
  employeeInitial: string;
  companyName: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "present" | "absent" | "late" | "on_leave" | "on_break";
  hoursWorked: number | null;
};

type DayData = {
  date: string;
  dayLabel: string;
  shortDay: string;
  isToday: boolean;
  isWeekend: boolean;
};

const statusConfig = {
  present: { color: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50", label: "P", ring: "ring-emerald-200" },
  absent: { color: "bg-red-400", textColor: "text-red-600", bgColor: "bg-red-50", label: "A", ring: "ring-red-200" },
  late: { color: "bg-amber-500", textColor: "text-amber-600", bgColor: "bg-amber-50", label: "L", ring: "ring-amber-200" },
  on_leave: { color: "bg-blue-400", textColor: "text-blue-600", bgColor: "bg-blue-50", label: "LV", ring: "ring-blue-200" },
  on_break: { color: "bg-purple-400", textColor: "text-purple-600", bgColor: "bg-purple-50", label: "BR", ring: "ring-purple-200" },
};

function getStatusForDay(records: AttendanceRecord[], date: string): AttendanceRecord | null {
  return records.find((r) => r.date === date) || null;
}

export function AttendanceSheet({
  records,
  weekDays,
  companies,
  currentCompany,
}: {
  records: AttendanceRecord[];
  weekDays: DayData[];
  companies: { id: string; name: string }[];
  currentCompany: string;
}) {
  const t = useTranslations("attendance");
  const locale = useLocale();
  const [view, setView] = useState<"weekly" | "table">("weekly");
  const [selectedCompany, setSelectedCompany] = useState(currentCompany);

  const groupedByCompany = records.reduce((acc, r) => {
    if (!acc[r.companyName]) acc[r.companyName] = [];
    acc[r.companyName]!.push(r);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const uniqueEmployees = Array.from(new Map(records.map((r) => [r.employeeName, r])).values());
  const employeesByCompany = uniqueEmployees.reduce((acc, r) => {
    if (!acc[r.companyName]) acc[r.companyName] = [];
    acc[r.companyName]!.push(r);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const today = weekDays.find((d) => d.isToday);
  const todayRecords = records.filter((r) => r.date === today?.date);
  const presentCount = todayRecords.filter((r) => r.status === "present").length;
  const lateCount = todayRecords.filter((r) => r.status === "late").length;
  const absentCount = todayRecords.filter((r) => r.status === "absent").length;
  const onLeaveCount = todayRecords.filter((r) => r.status === "on_leave").length;
  const totalEmp = uniqueEmployees.length;
  const attendanceRate = totalEmp > 0 ? Math.round(((presentCount + lateCount) / totalEmp) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KPICard title={t("totalPresent")} value={presentCount} icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
        <KPICard title={t("totalLate")} value={lateCount} icon={<Clock className="w-6 h-6" />} color="yellow" />
        <KPICard title={t("totalAbsent")} value={absentCount} icon={<XCircle className="w-6 h-6" />} color="red" />
        <KPICard title={t("totalOnLeave")} value={onLeaveCount} icon={<Plane className="w-6 h-6" />} color="blue" />
        <KPICard title={t("attendanceRate")} value={`${attendanceRate}%`} icon={<Calendar className="w-6 h-6" />} color="emerald" />
      </div>

      {/* View Toggle + Company Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/50 border border-outline-variant/20">
          <button
            onClick={() => setView("weekly")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all",
              view === "weekly" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant/60 hover:text-on-surface"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {t("weeklySheet")}
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all",
              view === "table" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant/60 hover:text-on-surface"
            )}
          >
            <Table2 className="w-3.5 h-3.5" />
            {t("tableView")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-on-surface-variant/40" />
          <span className="text-[13px] font-medium text-on-surface-variant/60">
            {t("weekOf", { date: weekDays[0]?.date || "" })}
          </span>
        </div>
      </div>

      {/* Weekly Sheet View */}
      {view === "weekly" && (
        <div className="space-y-4">
          {Object.entries(employeesByCompany).length === 0 ? (
            <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-dashed border-outline-variant/30 p-12 text-center">
              <div className="absolute top-0 inset-x-0 h-[3px] bg-outline-variant/10" />
              <Calendar className="w-14 h-14 text-on-surface-variant/15 mx-auto mb-4" />
              <h3 className="text-[18px] font-bold text-on-surface mb-1">{t("noDataToday")}</h3>
              <p className="text-[13px] text-on-surface-variant/50 max-w-sm mx-auto">{t("noDataTodayDesc")}</p>
            </div>
          ) : (
            Object.entries(employeesByCompany).map(([company, emps]) => (
              <div key={company} className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] overflow-x-auto">
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-400 to-blue-600" />
                {/* Company Header */}
                <div className="px-5 py-3 border-b border-outline-variant/10 bg-white/30">
                  <h3 className="text-[14px] font-bold text-on-surface">{company}</h3>
                  <p className="text-[11px] text-on-surface-variant/45">{emps.length} {t("employee")}{emps.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Sheet Grid */}
                <div className="min-w-[700px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-outline-variant/10">
                    <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/40">
                      {t("employee")}
                    </div>
                    {weekDays.map((day) => (
                      <div
                        key={day.date}
                        className={cn(
                          "px-2 py-2.5 text-center border-s border-outline-variant/10",
                          day.isToday && "bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          day.isToday ? "text-primary" : "text-on-surface-variant/40"
                        )}>
                          {day.shortDay}
                        </div>
                        <div className={cn(
                          "text-[16px] font-extrabold mt-0.5 leading-none",
                          day.isToday ? "text-primary" : day.isWeekend ? "text-on-surface-variant/25" : "text-on-surface"
                        )}>
                          {new Date(day.date).getDate()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Employee Rows */}
                  {emps.map((emp) => (
                    <div key={emp.employeeName} className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-outline-variant/5 last:border-0 hover:bg-white/40 transition-colors">
                      {/* Employee Info */}
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {emp.employeeInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-on-surface truncate leading-tight">{emp.employeeName}</p>
                          {emp.department && (
                            <p className="text-[10px] text-on-surface-variant/40 truncate">{emp.department}</p>
                          )}
                        </div>
                      </div>

                      {/* Day Cells */}
                      {weekDays.map((day) => {
                        const rec = getStatusForDay(records.filter((r) => r.employeeName === emp.employeeName), day.date);
                        const status = rec?.status || (day.isWeekend ? null : "absent");
                        const cfg = status ? statusConfig[status] : null;

                        return (
                          <div
                            key={day.date}
                            className={cn(
                              "px-1 py-3 flex flex-col items-center justify-center border-s border-outline-variant/5",
                              day.isToday && "bg-primary/3"
                            )}
                          >
                            {cfg ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ring-2", cfg.bgColor, cfg.textColor, cfg.ring)}>
                                  {cfg.label}
                                </div>
                                {rec?.checkIn && (
                                  <span className="text-[9px] text-on-surface-variant/40 font-medium">
                                    {rec.checkIn}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant/20">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] overflow-x-auto">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/40">{t("employee")}</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/40">{t("date")}</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/40">{t("checkIn")}</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/40">{t("checkOut")}</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/40">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <Calendar className="w-12 h-12 text-on-surface-variant/15 mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-on-surface mb-0.5">{t("noRecords")}</p>
                    <p className="text-[12px] text-on-surface-variant/45">{t("noRecordsDesc")}</p>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const cfg = statusConfig[rec.status];
                  return (
                    <tr key={rec.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-white/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[11px] font-bold text-primary">
                            {rec.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-on-surface leading-tight">{rec.employeeName}</p>
                            <p className="text-[10px] text-on-surface-variant/40">{rec.companyName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-on-surface-variant/70">{rec.date}</td>
                      <td className="px-5 py-3 text-[13px] font-medium text-on-surface">{rec.checkIn || "—"}</td>
                      <td className="px-5 py-3 text-[13px] font-medium text-on-surface">{rec.checkOut || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold", cfg.bgColor, cfg.textColor)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.color)} />
                          {t(rec.status === "on_leave" ? "onLeave" : rec.status === "on_break" ? "onBreak" : rec.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
