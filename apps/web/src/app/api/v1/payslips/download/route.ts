import { NextRequest, NextResponse } from "next/server";
import { auth } from "@intilaqa/auth";
import { prisma } from "@intilaqa/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const payslip = await prisma.payslip.findUnique({
    where: { id },
    include: {
      payrollRecord: true,
      employee: { include: { user: true } },
    },
  });
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const emp = payslip.employee;
  const pr = payslip.payrollRecord;

  doc.setFontSize(20);
  doc.text("Payslip", 105, 20, { align: "center" });
  doc.setFontSize(10);

  let y = 35;
  const cols: [string, string][] = [
    ["Employee", emp.user.name],
    ["Employee ID", emp.employeeId ?? "—"],
    ["Period", `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][pr.month-1] ?? "—"} ${pr.year}`],
    ["Base Salary", `${pr.baseSalary.toLocaleString()} SAR`],
    ["Allowances", `${pr.allowances.toLocaleString()} SAR`],
    ["Deductions", `${pr.deductions.toLocaleString()} SAR`],
    ["Net Pay", `${pr.netPay.toLocaleString()} SAR`],
    ["Status", pr.status],
  ];

  for (const [label, val] of cols) {
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 50, 8, "F");
    doc.rect(70, y, 80, 8, "F");
    doc.text(label, 22, y + 6);
    doc.text(val, 72, y + 6);
    y += 10;
  }

  const buf = Buffer.from(doc.output("arraybuffer"));

  // Store fileUrl if not set
  if (!payslip.fileUrl) {
    const fileUrl = `/api/v1/payslips/download?id=${id}`;
    await prisma.payslip.update({ where: { id }, data: { fileUrl } });
  }

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="payslip-${payslip.id}.pdf"`,
    },
  });
}
