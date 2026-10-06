import { NextRequest, NextResponse } from "next/server";
import { auth } from '@intilaqa/auth';
import { prisma } from "@intilaqa/db";
import { DashboardService } from "@/server/services/dashboard-service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dashboard = searchParams.get("dashboard") || "company";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: { include: { company: true } } },
    });

    if (!user?.employee?.companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 400 }
      );
    }

    let stats: any = {};

    if (dashboard === "company") {
      stats = await DashboardService.getCompanyDashboardStats(
        user.employee.companyId
      );
    } else if (dashboard === "employee") {
      stats = await DashboardService.getEmployeeDashboardStats(
        user.employee.id
      );
    } else if (dashboard === "attendance") {
      stats = await DashboardService.getAttendanceStats(
        user.employee.companyId
      );
    } else if (dashboard === "payroll") {
      stats = await DashboardService.getPayrollStats(user.employee.companyId);
    } else if (dashboard === "compliance") {
      stats = await DashboardService.getComplianceStats(
        user.employee.companyId
      );
    } else if (dashboard === "loans") {
      stats = await DashboardService.getLoanStats(user.employee.companyId);
    } else if (dashboard === "department") {
      if (!user.employee.departmentId) {
        return NextResponse.json(
          { error: "Employee not in a department" },
          { status: 400 }
        );
      }
      stats = await DashboardService.getDepartmentStats(
        user.employee.departmentId
      );
    }

    return NextResponse.json({
      success: true,
      dashboard,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
