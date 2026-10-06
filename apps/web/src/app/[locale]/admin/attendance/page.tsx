import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { PageHeader } from "@intilaqa/ui";
import { AttendanceSheet } from "./attendance-sheet";

export default async function AttendancePage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ search?: string; page?: string; company?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("attendance");
  const dt = await getTranslations("dashboard");
  const ct = await getTranslations("common");

  const sp = await searchParams;
  const companyFilter = sp.company || "";

  // Build week days (Mon-Sun)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0]!;
    const dayNames = [t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")];
    const dayName = dayNames[d.getDay()] || "";
    return {
      date: dateStr,
      dayLabel: dayName,
      shortDay: dayName.substring(0, 3),
      isToday: d.toDateString() === now.toDateString(),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  const weekStart = new Date(monday);
  const weekEnd = new Date(monday);
  weekEnd.setDate(monday.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const companyScope = companyFilter ? { employee: { companyId: companyFilter } } : {};

  const [companies, records] = await Promise.all([
    prisma.company.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        ...companyScope,
        date: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { date: "asc" },
      include: {
        employee: {
          include: {
            user: { select: { name: true } },
            company: { select: { name: true } },
            department: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const attendanceRecords = records.map((r) => ({
    id: r.id,
    employeeName: r.employee.user.name,
    employeeInitial: r.employee.user.name.charAt(0).toUpperCase(),
    companyName: r.employee.company.name,
    department: r.employee.department?.name || "",
    date: r.date.toISOString().split("T")[0]!,
    checkIn: r.checkIn
      ? new Date(r.checkIn).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : null,
    checkOut: r.checkOut
      ? new Date(r.checkOut).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
      : null,
    status: r.checkIn
      ? r.checkOut
        ? "present" as const
        : "on_break" as const
      : "absent" as const,
    hoursWorked: r.checkIn && r.checkOut
      ? Math.round((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 3600000 * 10) / 10
      : null,
  }));

  return (
    <div>
      <PageHeader
        title={t("title")}
        breadcrumbs={[{ label: dt("overview"), href: `/${locale}/admin` }, { label: t("title") }]}
      />

      <AttendanceSheet
        records={attendanceRecords}
        weekDays={weekDays}
        companies={companies}
        currentCompany={companyFilter}
      />
    </div>
  );
}
