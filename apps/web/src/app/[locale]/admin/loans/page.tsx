import { getTranslations } from "next-intl/server";
import { auth } from "@intilaqa/auth";
import { redirect } from "next/navigation";
import { prisma } from "@intilaqa/db";
import { AdminLoansContent } from "./admin-loans-content";

const PAGE_SIZE = 20;

export default async function AdminLoansPage(props: { searchParams: Promise<{ page?: string }>, params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));

  let error: string | null = null;
  let loanRequests: {
    id: string;
    employeeName: string;
    companyName: string;
    amount: number;
    purpose: string;
    expectedRepaymentMonths: number;
    monthlyDeduction: number;
    status: string;
    createdAt: Date;
  }[] = [];
  let totalCount = 0;

  try {
    const [requests, total] = await Promise.all([
      prisma.employeeRequest.findMany({
        where: { type: "loan" },
        include: {
          employee: {
            include: {
              user: { select: { name: true } },
              company: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.employeeRequest.count({ where: { type: "loan" } }),
    ]);

    totalCount = total;
    loanRequests = requests.map((r) => ({
      id: r.id,
      employeeName: r.employee.user.name,
      companyName: r.employee.company.name,
      amount: (r.metadata as any)?.loanAmount || 0,
      purpose: r.reason || "",
      expectedRepaymentMonths: (r.metadata as any)?.expectedRepaymentMonths || 0,
      monthlyDeduction: (r.metadata as any)?.monthlyDeduction || 0,
      status: r.status,
      createdAt: r.createdAt,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load loan requests";
  }

  return (
    <AdminLoansContent
      loanRequests={loanRequests}
      error={error}
      currentPage={page}
      totalPages={Math.ceil(totalCount / PAGE_SIZE)}
    />
  );
}
