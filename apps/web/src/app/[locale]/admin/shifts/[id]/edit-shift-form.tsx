"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Clock, Repeat, Moon, Leaf, Users } from "lucide-react";
import { TimelineBar, cn } from "@intilaqa/ui";

const dayLabels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const breakPresets = [15, 30, 45, 60, 90];

const typeOptions = [
  { value: "fixed", icon: Clock, color: "blue" as const },
  { value: "variable", icon: Repeat, color: "emerald" as const },
  { value: "night", icon: Moon, color: "purple" as const },
  { value: "seasonal", icon: Leaf, color: "amber" as const },
];

type ShiftData = {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  workingDays: number;
  breakMinutes: number;
  companyId: string | null;
  isActive: boolean;
};

type Assignment = {
  id: string;
  employeeName: string;
  startDate: string;
};

function daysToSelected(days: number): boolean[] {
  const arr = [true, true, true, true, true, false, false];
  for (let i = days; i < 7; i++) arr[i] = false;
  return arr;
}

export function EditShiftForm({
  shift,
  companies,
  assignments,
  locale,
}: {
  shift: ShiftData;
  companies: { id: string; name: string }[];
  assignments: Assignment[];
  locale: string;
}) {
  const t = useTranslations("shifts");
  const tc = useTranslations("common");

  const [name, setName] = useState(shift.name);
  const [type, setType] = useState(shift.type);
  const [companyId, setCompanyId] = useState(shift.companyId || "");
  const [startTime, setStartTime] = useState(shift.startTime);
  const [endTime, setEndTime] = useState(shift.endTime);
  const [workingDays, setWorkingDays] = useState(shift.workingDays);
  const [breakMinutes, setBreakMinutes] = useState(shift.breakMinutes);
  const [selectedDays, setSelectedDays] = useState<boolean[]>(daysToSelected(shift.workingDays));

  const toggleDay = (idx: number) => {
    const next = [...selectedDays];
    next[idx] = !next[idx];
    setSelectedDays(next);
    setWorkingDays(next.filter(Boolean).length);
  };

  const selectedType = typeOptions.find((o) => o.value === type) as typeof typeOptions[number];
  const TypeIcon = selectedType.icon;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary to-primary-700" />
        <div className="p-6">
          <h2 className="text-[16px] font-bold text-on-surface mb-1">{t("shiftDetails")}</h2>
          <p className="text-[13px] text-on-surface-variant/50 mb-5">{t("shiftDescription")}</p>

          <div className="space-y-5">
            <div>
              <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{t("shiftName")}</label>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] placeholder:text-on-surface-variant/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{t("type")}</label>
              <div className="grid grid-cols-4 gap-2">
                {typeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = type === opt.value;
                  return (
                    <label key={opt.value} className="cursor-pointer">
                      <input type="radio" name="type" value={opt.value} checked={selected} onChange={() => setType(opt.value)} className="sr-only" />
                      <div className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/20 hover:border-outline-variant/40 bg-white/40"
                      )}>
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center",
                          selected ? "bg-primary text-white" : "bg-on-surface-variant/10 text-on-surface-variant/50"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={cn("text-xs font-semibold", selected ? "text-primary" : "text-on-surface-variant/60")}>
                          {t(opt.value)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{tc("company")}</label>
              <select
                name="companyId"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
              >
                <option value="">{tc("none")}</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{t("startTime")}</label>
                <input
                  type="time"
                  name="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{t("endTime")}</label>
                <input
                  type="time"
                  name="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{t("selectDays")}</label>
              <div className="flex gap-2">
                {dayLabels.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-semibold transition-all",
                      selectedDays[idx]
                        ? "bg-primary text-white shadow-sm"
                        : "bg-on-surface-variant/8 text-on-surface-variant/50 hover:bg-on-surface-variant/15"
                    )}
                  >
                    {t(day)}
                  </button>
                ))}
              </div>
              <input type="hidden" name="workingDays" value={workingDays} />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-on-surface/70 uppercase tracking-[0.06em] mb-1.5">{t("breakMinutes")}</label>
              <div className="flex gap-2">
                {breakPresets.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setBreakMinutes(min)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                      breakMinutes === min
                        ? "bg-primary text-white shadow-sm"
                        : "bg-on-surface-variant/8 text-on-surface-variant/50 hover:bg-on-surface-variant/15"
                    )}
                  >
                    {min}m
                  </button>
                ))}
              </div>
              <input type="hidden" name="breakMinutes" value={breakMinutes} />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isActive" value="true" defaultChecked={shift.isActive} className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium text-on-surface">{tc("active")}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-400 to-blue-600" />
        <div className="p-6">
          <h3 className="text-[16px] font-bold text-on-surface mb-4">{t("timeline")}</h3>
          <TimelineBar start={startTime} end={endTime} color={selectedType.color} height={12} />
          <div className="mt-3 flex items-center justify-between text-xs text-on-surface-variant/50">
            <span className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {t(type)}
            </span>
            <span>{workingDays} {t("days")} / {breakMinutes} {t("min")}</span>
          </div>
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-on-surface-variant/40" />
              <h3 className="text-[16px] font-bold text-on-surface">{t("assignedEmployees")}</h3>
              <span className="text-[11px] font-bold text-on-surface-variant/40 bg-on-surface-variant/8 px-2 py-0.5 rounded-full">{assignments.length}</span>
            </div>
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
                  <span className="text-[14px] font-medium text-on-surface">{a.employeeName}</span>
                  <span className="text-[12px] text-on-surface-variant/40">{a.startDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Link
          href={`/${locale}/admin/shifts`}
          className="px-6 py-2.5 rounded-2xl bg-white/60 border border-outline-variant/30 text-on-surface text-[14px] font-bold hover:bg-white/80 transition-all"
        >
          {tc("cancel")}
        </Link>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-2xl bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {tc("save")}
        </button>
      </div>
    </div>
  );
}
