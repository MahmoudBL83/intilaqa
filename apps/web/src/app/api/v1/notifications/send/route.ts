import { NextRequest, NextResponse } from "next/server";
import { auth } from '@intilaqa/auth';
import { EmailNotificationService } from "@/server/services/email-notification-service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, recipientName, recipientEmail, recipientPhone, data } = body;

    if (!type || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await EmailNotificationService.send({
      type: type as any,
      recipient: {
        name: recipientName || "User",
        email: recipientEmail,
        phone: recipientPhone,
      },
      data: data || {},
      sendEmail: true,
      sendSms: !!recipientPhone,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        message: "Use POST to send notifications",
        supportedTypes: [
          "loan_approved",
          "loan_rejected",
          "attendance_alert",
          "late_arrival",
          "absent_alert",
          "payroll_ready",
          "payslip_generated",
          "document_expiry",
          "compliance_alert",
          "overtime_alert",
          "leave_request_approved",
          "leave_request_rejected",
        ],
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get notification types" },
      { status: 500 }
    );
  }
}
