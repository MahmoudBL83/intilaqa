import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@intilaqa/db";
import { PageHeader, DataTable, KPICard, StatusBadge } from "@intilaqa/ui";
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default async function EmployeeAttendancePage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const userId = (session.user as { id?: string }).id;
  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (!employee) redirect(`/${locale}/login`);

  const t = await getTranslations("attendance");
  const td = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const sp = await searchParams;
  const now = new Date();
  const selectedMonth = parseInt(sp.month || String(now.getMonth() + 1));
  const selectedYear = parseInt(sp.year || String(now.getFullYear()));

  const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
  const monthEnd = new Date(selectedYear, selectedMonth, 0);

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;

  const [records, monthStats] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { employeeId: employee.id, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: "desc" },
    }),
    prisma.attendanceRecord.groupBy({
      by: ["status"],
      where: { employeeId: employee.id, date: { gte: monthStart, lte: monthEnd } },
      _count: { status: true },
    }),
  ]);

  const getCount = (status: string) => monthStats.find((s) => s.status === status)?._count.status || 0;
  const presentCount = getCount("present");
  const lateCount = getCount("late");
  const absentCount = getCount("absent");
  const totalDays = presentCount + lateCount + absentCount;

  // Build calendar grid
  const daysInMonth = monthEnd.getDate();
  const startDow = monthStart.getDay();
  const calendar: { day: number; status: string | null }[] = [];
  for (let i = 0; i < startDow; i++) calendar.push({ day: 0, status: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const rec = records.find((r) => r.date.getDate() === d);
    calendar.push({ day: d, status: rec?.status || null });
  }

  const statusColors: Record<string, string> = {
    present: "bg-emerald-400", late: "bg-yellow-400", absent: "bg-red-300",
  };

  const rows = records.map((r) => ({
    id: r.id, date: r.date.toLocaleDateString(locale),
    checkIn: r.checkIn?.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) || "—",
    checkOut: r.checkOut?.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) || "—",
    statusDisplay: r.status,
  }));

  return (
    <div>
      <PageHeader title={t("title")} breadcrumbs={[{ label: td("overview"), href: `/${locale}/employee` }, { label: t("title") }]} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KPICard title={t("present")} value={presentCount} icon={<CheckCircle className="w-5 h-5" />} color="emerald" />
        <KPICard title={t("late")} value={lateCount} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <KPICard title={t("absent")} value={absentCount} icon={<XCircle className="w-5 h-5" />} color="red" />
      </div>

      <div className="floating-glass rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href={`?month=${prevMonth}&year=${prevYear}`} className="p-2 rounded-xl hover:bg-white/30 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h3 className="text-[16px] font-bold text-on-surface">
            {new Date(selectedYear, selectedMonth - 1).toLocaleString(locale, { month: "long", year: "numeric" })}
          </h3>
          <Link href={`?month=${nextMonth}&year=${nextYear}`} className="p-2 rounded-xl hover:bg-white/30 transition-all">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-center text-on-surface-variant/50 text-[12px] mb-4">{totalDays} {td("attendanceDays")}</p>
        <div className="grid grid-cols-7 gap-1">
          {["sun","mon","tue","wed","thu","fri","sat"].map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant/50 uppercase py-1">{tc("weekdays."+d)}</div>
          ))}
          {calendar.map((c, i) => (
            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-[12px] font-bold ${c.day === 0 ? "" : c.status ? statusColors[c.status] + " text-white" : "bg-gray-100 text-gray-400"}`}>
              {c.day > 0 ? c.day : ""}
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={[
          { key: "date", header: t("date") },
          { key: "checkIn", header: t("checkIn") },
          { key: "checkOut", header: t("checkOut") },
          { key: "statusDisplay", header: t("status"), type: "status" },
        ]}
        data={rows}
        emptyTitle={tc("noData")}
        emptyDescription={tc("noResults")}
      />
    </div>
  );
}
