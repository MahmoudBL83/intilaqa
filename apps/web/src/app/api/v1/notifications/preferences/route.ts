import { NextRequest, NextResponse } from "next/server";
import { auth } from '@intilaqa/auth';
import { prisma } from "@intilaqa/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  let pref = await prisma.notificationPreference.findUnique({ where: { userId } });

  if (!pref) {
    pref = await prisma.notificationPreference.create({ data: { userId } });
  }

  const preferences = [
    { type: "loan_approved", email: pref.loanApproved, sms: pref.smsEnabled },
    { type: "loan_rejected", email: pref.loanRejected, sms: pref.smsEnabled },
    { type: "attendance_alert", email: pref.attendanceAlert, sms: pref.smsEnabled },
    { type: "payslip_generated", email: pref.payslipGenerated, sms: pref.smsEnabled },
    { type: "document_expiry", email: pref.documentExpiry, sms: pref.smsEnabled },
    { type: "compliance_alert", email: pref.complianceAlert, sms: pref.smsEnabled },
  ];

  return NextResponse.json(preferences);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await request.json();
  const { emailEnabled, smsEnabled, types } = body;

  const data: Record<string, boolean> = {};
  if (typeof emailEnabled === "boolean") data.emailEnabled = emailEnabled;
  if (typeof smsEnabled === "boolean") data.smsEnabled = smsEnabled;
  if (types) {
    data.loanApproved = types.loan_approved ?? true;
    data.loanRejected = types.loan_rejected ?? true;
    data.payslipGenerated = types.payslip_generated ?? true;
    data.attendanceAlert = types.attendance_alert ?? true;
    data.documentExpiry = types.document_expiry ?? true;
    data.complianceAlert = types.compliance_alert ?? true;
  }

  await prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json({ success: true, message: "Preferences saved" });
}
