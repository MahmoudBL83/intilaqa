import { NextRequest, NextResponse } from "next/server";
import { auth } from '@intilaqa/auth';
import { prisma } from "@intilaqa/db";
import { EmailNotificationService } from "@/server/services/email-notification-service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: "Notification type required" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employee: true },
    });

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Send test notification
    let result;

    switch (type) {
      case "loan_approved":
        result = await EmailNotificationService.sendLoanNotification(
          user.id,
          user.name || "User",
          user.email,
          "approved",
          50000,
          { monthlyDeduction: 2500, repaymentMonths: 20 }
        );
        break;

      case "loan_rejected":
        result = await EmailNotificationService.sendLoanNotification(
          user.id,
          user.name || "User",
          user.email,
          "rejected",
          50000,
          { reason: "This is a test notification" }
        );
        break;

      case "payslip_generated":
        result = await EmailNotificationService.sendPayslipNotification(
          user.id,
          user.name || "User",
          user.email,
          new Date().getMonth() + 1,
          new Date().getFullYear(),
          15000
        );
        break;

      case "attendance_alert":
        result = await EmailNotificationService.sendAttendanceAlert(
          user.id,
          user.name || "User",
          user.email,
          "late",
          new Date().toLocaleDateString(),
          { lateMinutes: 15, shiftStart: "09:00 AM" }
        );
        break;

      case "document_expiry":
        result = await EmailNotificationService.sendDocumentExpiryAlert(
          user.id,
          user.name || "User",
          user.email,
          "Passport",
          new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        );
        break;

      default:
        result = await EmailNotificationService.send({
          type: type as any,
          recipient: {
            name: user.name || "User",
            email: user.email,
          },
          data: {
            employeeName: user.name || "User",
            message: `This is a test ${type} notification`,
          },
          sendEmail: true,
        });
    }

    return NextResponse.json({
      success: result.success,
      message: "Test notification sent",
      result,
    });
  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test notification" },
      { status: 500 }
    );
  }
}
