import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getPayrollRun } from "@/server/services/payroll-engine";
import { PayrollRunDetailContent } from "./payroll-run-detail-content";

export default async function PayrollRunDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const run = await getPayrollRun(id);
  if (!run) notFound();

  const items = run.items.map((i) => ({
    id: i.id,
    employeeId: i.employee.id,
    employeeName: i.employee.user?.name ?? "—",
    employeeCode: i.employee.employeeId ?? "—",
    position: i.employee.position ?? "—",
    baseSalary: i.baseSalary,
    allowances: i.allowances,
    absenceDeduction: i.absenceDeduction,
    lateDeduction: i.lateDeduction,
    violationDeduction: i.violationDeduction,
    otherDeductions: i.otherDeductions,
    grossSalary: i.grossSalary,
    totalDeductions: i.totalDeductions,
    netSalary: i.netSalary,
  }));

  return (
    <PayrollRunDetailContent
      locale={locale}
      run={{
        id: run.id,
        payrollMonth: run.payrollMonth,
        status: run.status,
        totalGross: run.totalGross,
        totalDeductions: run.totalDeductions,
        totalNet: run.totalNet,
        companyName: run.company?.name ?? "—",
        createdAt: run.createdAt.toISOString(),
        approvedAt: run.approvedAt?.toISOString() ?? null,
        paidAt: run.paidAt?.toISOString() ?? null,
      }}
      items={items}
    />
  );
}
