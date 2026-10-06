"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Edit2, Clock, Calendar, Coffee, Building2, Moon, Sun, Repeat, Leaf } from "lucide-react";
import { TimelineBar, cn } from "@intilaqa/ui";

type ShiftData = {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  workingDays: number;
  breakMinutes: number;
  companyName: string;
  companyId: string | null;
  isActive: boolean;
};

const typeConfig: Record<string, { color: "blue" | "emerald" | "purple" | "amber"; icon: React.ElementType; label: string; gradient: string; iconBg: string; badge: string }> = {
  fixed: { color: "blue", icon: Clock, label: "fixed", gradient: "from-blue-50 to-blue-100/50 border-blue-200/50", iconBg: "bg-blue-100 text-blue-600", badge: "bg-blue-50 text-blue-700" },
  variable: { color: "emerald", icon: Repeat, label: "variable", gradient: "from-emerald-50 to-emerald-100/50 border-emerald-200/50", iconBg: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-50 text-emerald-700" },
  night: { color: "purple", icon: Moon, label: "night", gradient: "from-purple-50 to-purple-100/50 border-purple-200/50", iconBg: "bg-purple-100 text-purple-600", badge: "bg-purple-50 text-purple-700" },
  seasonal: { color: "amber", icon: Leaf, label: "seasonal", gradient: "from-amber-50 to-amber-100/50 border-amber-200/50", iconBg: "bg-amber-100 text-amber-600", badge: "bg-amber-50 text-amber-700" },
};

function ShiftCard({ shift, editPath }: { shift: ShiftData; editPath: string }) {
  const tc = useTranslations("shifts");
  const locale = useLocale();
  const config = typeConfig[shift.type] as typeof typeConfig[keyof typeof typeConfig] ?? typeConfig.fixed;
  const TypeIcon = config.icon;

  return (
    <Link href={`/${locale}${editPath}/${shift.id}`} className="block group">
      <div className={`relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br backdrop-blur-xl border shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 ${config.gradient}`}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                <TypeIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{shift.name}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${config.badge}`}>
                  {tc(config.label)}
                </span>
              </div>
            </div>
            <div className={cn(
              "w-2 h-2 rounded-full mt-1",
              shift.isActive ? "bg-green-500" : "bg-gray-300"
            )} />
          </div>

          <TimelineBar start={shift.startTime} end={shift.endTime} color={config.color} className="mb-3" />

          <div className="flex items-center justify-between text-xs text-on-surface-variant/50">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {shift.workingDays}d/w
              </span>
              <span className="flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                {shift.breakMinutes}m
              </span>
            </div>
            {shift.companyName && (
              <span className="flex items-center gap-1 text-on-surface-variant/40">
                <Building2 className="w-3 h-3" />
                {shift.companyName}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ShiftsContent({
  shifts,
  emptyTitle,
  emptyDescription,
}: {
  shifts: ShiftData[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  const locale = useLocale();
  const t = useTranslations("shifts");

  if (shifts.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-dashed border-outline-variant/30 p-12 text-center">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-outline-variant/10" />
        <Clock className="w-14 h-14 text-on-surface-variant/15 mx-auto mb-4" />
        <p className="text-[18px] font-bold text-on-surface mb-1">{emptyTitle}</p>
        <p className="text-[13px] text-on-surface-variant/50 max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  const grouped = shifts.reduce<Record<string, ShiftData[]>>((acc, s) => {
    const key = s.companyId || "__unassigned__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const companyOrder = Object.keys(grouped).sort((a, b) => {
    if (a === "__unassigned__") return 1;
    if (b === "__unassigned__") return -1;
    const aName = grouped[a]?.[0]?.companyName ?? "";
    const bName = grouped[b]?.[0]?.companyName ?? "";
    return aName.localeCompare(bName);
  });

  return (
    <div className="space-y-6">
      {companyOrder.map((companyId) => {
        const companyShifts = grouped[companyId] ?? [];
        const companyName = companyId === "__unassigned__" ? null : (companyShifts[0]?.companyName ?? "");

        return (
          <div key={companyId}>
            {companyName && (
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-on-surface-variant/40" />
                <h3 className="text-sm font-bold text-on-surface">{companyName}</h3>
                <span className="text-[11px] font-bold text-on-surface-variant/40 bg-on-surface-variant/8 px-2 py-0.5 rounded-full">{companyShifts.length}</span>
              </div>
            )}
            {!companyName && companyShifts.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-on-surface-variant/25" />
                <h3 className="text-sm font-medium text-on-surface-variant/40">{t("unassigned")}</h3>
                <span className="text-[11px] font-bold text-on-surface-variant/30 bg-on-surface-variant/5 px-2 py-0.5 rounded-full">{companyShifts.length}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {companyShifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} editPath="/admin/shifts" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
