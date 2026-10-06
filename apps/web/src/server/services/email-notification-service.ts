/**
 * Email/SMS Notification Service
 * Handles external notifications via email and SMS
 * Integrates with internal notification system
 */

import { prisma } from "@intilaqa/db";

export type NotificationType =
  | "loan_approved"
  | "loan_rejected"
  | "attendance_alert"
  | "late_arrival"
  | "absent_alert"
  | "payroll_ready"
  | "payslip_generated"
  | "document_expiry"
  | "compliance_alert"
  | "overtime_alert"
  | "leave_request_approved"
  | "leave_request_rejected";

export interface NotificationRecipient {
  email?: string;
  phone?: string;
  name: string;
}

export interface NotificationPayload {
  type: NotificationType;
  recipient: NotificationRecipient;
  data: Record<string, any>;
  sendEmail?: boolean;
  sendSms?: boolean;
}

export interface NotificationResult {
  success: boolean;
  emailSent: boolean;
  smsSent: boolean;
  message?: string;
  error?: string;
}

export class EmailNotificationService {
  /**
   * Send email and SMS notifications
   */
  static async send(payload: NotificationPayload): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      emailSent: false,
      smsSent: false,
    };

    try {
      // Send email if enabled and email exists
      if (payload.sendEmail !== false && payload.recipient.email) {
        try {
          result.emailSent = await this.sendEmail(payload);
        } catch (error) {
          console.error("Email send failed:", error);
          result.emailSent = false;
        }
      }

      // Send SMS if enabled and phone exists
      if (payload.sendSms && payload.recipient.phone) {
        try {
          result.smsSent = await this.sendSms(payload);
        } catch (error) {
          console.error("SMS send failed:", error);
          result.smsSent = false;
        }
      }

      result.success = result.emailSent || result.smsSent;
      result.message = `Notification sent (Email: ${result.emailSent}, SMS: ${result.smsSent})`;

      return result;
    } catch (error: any) {
      result.error = error.message;
      return result;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmail(payload: NotificationPayload): Promise<boolean> {
    const template = this.getEmailTemplate(payload.type, payload.data);

    console.log("📧 Email Notification:", {
      to: payload.recipient.email,
      subject: template.subject,
    });

    // TODO: Integrate with email provider
    // In production, use SendGrid, AWS SES, or similar:
    // const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    //   method: "POST",
    //   headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}` },
    //   body: JSON.stringify({...})
    // });

    // For now, simulate successful delivery
    return true;
  }

  /**
   * Send SMS notification
   */
  private static async sendSms(payload: NotificationPayload): Promise<boolean> {
    const message = this.getSmsTemplate(payload.type, payload.data);

    console.log("📱 SMS Notification:", {
      to: payload.recipient.phone,
      message: message.substring(0, 50) + "...",
    });

    // TODO: Integrate with SMS provider
    // In production, use Twilio, AWS SNS, or similar:
    // const response = await fetch("https://api.twilio.com/2010-04-01/...", {
    //   method: "POST",
    //   body: new URLSearchParams({...})
    // });

    // For now, simulate successful delivery
    return true;
  }

  /**
   * Get email template for notification type
   */
  private static getEmailTemplate(
    type: NotificationType,
    data: Record<string, any>
  ): { subject: string; body: string; html: string } {
    const templates: Record<
      NotificationType,
      (data: any) => { subject: string; body: string; html: string }
    > = {
      loan_approved: (data) => ({
        subject: `Your Loan Request Has Been Approved - SAR ${data.loanAmount}`,
        body: `Dear ${data.employeeName},\n\nYour loan request for SAR ${data.loanAmount} has been approved.\n\nMonthly Deduction: SAR ${data.monthlyDeduction}\nRepayment Period: ${data.repaymentMonths} months`,
        html: `<h2>Loan Approved ✓</h2><p>Dear ${data.employeeName},</p><p>Your loan request for <strong>SAR ${data.loanAmount}</strong> has been approved.</p><ul><li>Monthly Deduction: <strong>SAR ${data.monthlyDeduction}</strong></li><li>Repayment Period: <strong>${data.repaymentMonths} months</strong></li></ul>`,
      }),
      loan_rejected: (data) => ({
        subject: "Your Loan Request Has Been Rejected",
        body: `Dear ${data.employeeName},\n\nYour loan request has been rejected.\n\nReason: ${data.reason}`,
        html: `<h2>Loan Rejected ✗</h2><p>Dear ${data.employeeName},</p><p>Unfortunately, your loan request has been rejected.</p><p><strong>Reason:</strong> ${data.reason}</p>`,
      }),
      attendance_alert: (data) => ({
        subject: "Attendance Alert",
        body: `Dear ${data.employeeName},\n\nAttendance record for ${data.date}: ${data.status}`,
        html: `<h2>Attendance Alert</h2><p>Dear ${data.employeeName},</p><p>Your attendance for <strong>${data.date}</strong> is marked as <strong>${data.status}</strong></p>`,
      }),
      late_arrival: (data) => ({
        subject: `Late Arrival Alert - ${data.lateMinutes} minutes`,
        body: `Dear ${data.employeeName},\n\nYou arrived ${data.lateMinutes} minutes late on ${data.date}.\n\nShift Start: ${data.shiftStart}`,
        html: `<h2>Late Arrival ⏰</h2><p>Dear ${data.employeeName},</p><p>You arrived <strong>${data.lateMinutes} minutes late</strong> on ${data.date}</p><p>Shift Start: ${data.shiftStart}</p>`,
      }),
      absent_alert: (data) => ({
        subject: "Absence Alert",
        body: `Dear ${data.employeeName},\n\nYou were marked absent on ${data.date}`,
        html: `<h2>Absence Alert</h2><p>Dear ${data.employeeName},</p><p>You were marked absent on <strong>${data.date}</strong></p>`,
      }),
      payroll_ready: (data) => ({
        subject: `Payroll Ready - ${data.month}/${data.year}`,
        body: `Dear ${data.employeeName},\n\nYour payroll for ${data.month}/${data.year} has been processed and is ready for disbursement.`,
        html: `<h2>Payroll Ready 💰</h2><p>Dear ${data.employeeName},</p><p>Your payroll for <strong>${data.month}/${data.year}</strong> has been processed and is ready for disbursement.</p>`,
      }),
      payslip_generated: (data) => ({
        subject: `Your Payslip - ${data.month}/${data.year}`,
        body: `Dear ${data.employeeName},\n\nYour payslip for ${data.month}/${data.year} has been generated.\n\nNet Pay: SAR ${data.netPay}`,
        html: `<h2>Payslip Generated 📄</h2><p>Dear ${data.employeeName},</p><p>Your payslip for <strong>${data.month}/${data.year}</strong> has been generated.</p><p>Net Pay: <strong>SAR ${data.netPay}</strong></p>`,
      }),
      document_expiry: (data) => ({
        subject: `Document Expiry Alert - ${data.documentName}`,
        body: `Dear ${data.employeeName},\n\n${data.documentName} will expire on ${data.expiryDate}.\n\nPlease renew your document to avoid compliance issues.`,
        html: `<h2>Document Expiry Alert ⚠️</h2><p>Dear ${data.employeeName},</p><p><strong>${data.documentName}</strong> will expire on <strong>${data.expiryDate}</strong>.</p><p>Please renew your document to avoid compliance issues.</p>`,
      }),
      compliance_alert: (data) => ({
        subject: "Compliance Alert",
        body: `Dear ${data.employeeName},\n\n${data.message}`,
        html: `<h2>Compliance Alert</h2><p>Dear ${data.employeeName},</p><p>${data.message}</p>`,
      }),
      overtime_alert: (data) => ({
        subject: `Overtime Alert - ${data.overtimeHours} hours`,
        body: `Dear ${data.employeeName},\n\nYou worked ${data.overtimeHours} hours of overtime on ${data.date}`,
        html: `<h2>Overtime Alert</h2><p>Dear ${data.employeeName},</p><p>You worked <strong>${data.overtimeHours} hours</strong> of overtime on ${data.date}</p>`,
      }),
      leave_request_approved: (data) => ({
        subject: "Your Leave Request Has Been Approved",
        body: `Dear ${data.employeeName},\n\nYour leave request for ${data.startDate} to ${data.endDate} has been approved.`,
        html: `<h2>Leave Approved ✓</h2><p>Dear ${data.employeeName},</p><p>Your leave request for <strong>${data.startDate}</strong> to <strong>${data.endDate}</strong> has been approved.</p>`,
      }),
      leave_request_rejected: (data) => ({
        subject: "Your Leave Request Has Been Rejected",
        body: `Dear ${data.employeeName},\n\nYour leave request has been rejected.\n\nReason: ${data.reason}`,
        html: `<h2>Leave Rejected ✗</h2><p>Dear ${data.employeeName},</p><p>Your leave request has been rejected.</p><p><strong>Reason:</strong> ${data.reason}</p>`,
      }),
    };

    const template = templates[type];
    if (!template) {
      return {
        subject: "Notification from Intilaqa HRMS",
        body: "You have a new notification",
        html: "<p>You have a new notification from Intilaqa HRMS</p>",
      };
    }

    return template(data);
  }

  /**
   * Get SMS template for notification type
   */
  private static getSmsTemplate(
    type: NotificationType,
    data: Record<string, any>
  ): string {
    const templates: Record<NotificationType, (data: any) => string> = {
      loan_approved: (data) =>
        `Loan approved! SAR ${data.loanAmount} with monthly deduction of SAR ${data.monthlyDeduction}`,
      loan_rejected: (data) => `Loan rejected. Reason: ${data.reason}`,
      attendance_alert: (data) => `Attendance: ${data.date} marked as ${data.status}`,
      late_arrival: (data) => `Late arrival: ${data.lateMinutes} mins on ${data.date}`,
      absent_alert: (data) => `Marked absent on ${data.date}`,
      payroll_ready: (data) =>
        `Payroll for ${data.month}/${data.year} is ready for disbursement`,
      payslip_generated: (data) =>
        `Payslip ${data.month}/${data.year} generated. Net Pay: SAR ${data.netPay}`,
      document_expiry: (data) =>
        `${data.documentName} expires on ${data.expiryDate}. Please renew.`,
      compliance_alert: (data) => `Compliance: ${data.message}`,
      overtime_alert: (data) =>
        `Overtime: ${data.overtimeHours} hours on ${data.date}`,
      leave_request_approved: (data) =>
        `Leave approved ${data.startDate} to ${data.endDate}`,
      leave_request_rejected: (data) =>
        `Leave rejected. Reason: ${data.reason}`,
    };

    const template = templates[type];
    if (!template) {
      return "New notification from Intilaqa HRMS";
    }

    return template(data);
  }

  /**
   * Send loan notification (helper)
   */
  static async sendLoanNotification(
    employeeId: string,
    employeeName: string,
    email: string,
    status: "approved" | "rejected",
    loanAmount: number,
    details?: Record<string, any>
  ): Promise<NotificationResult> {
    const type = status === "approved" ? "loan_approved" : "loan_rejected";

    const payload: NotificationPayload = {
      type: type as NotificationType,
      recipient: { name: employeeName, email },
      data: {
        employeeName,
        loanAmount,
        ...(status === "approved" && {
          monthlyDeduction: details?.monthlyDeduction || 0,
          repaymentMonths: details?.repaymentMonths || 0,
        }),
        ...(status === "rejected" && {
          reason: details?.reason || "No reason provided",
        }),
      },
      sendEmail: true,
    };

    // Also create in-app notification
    const user = await prisma.user.findFirst({
      where: { employee: { id: employeeId } },
    });

    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: status === "approved" ? "Loan Approved" : "Loan Rejected",
          message:
            status === "approved"
              ? `Your loan request for SAR ${loanAmount} has been approved`
              : `Your loan request has been rejected`,
          type,
        },
      });
    }

    return this.send(payload);
  }

  /**
   * Send payslip notification (helper)
   */
  static async sendPayslipNotification(
    employeeId: string,
    employeeName: string,
    email: string,
    month: number,
    year: number,
    netPay: number
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: "payslip_generated",
      recipient: { name: employeeName, email },
      data: { employeeName, month, year, netPay },
      sendEmail: true,
    };

    // Also create in-app notification
    const user = await prisma.user.findFirst({
      where: { employee: { id: employeeId } },
    });

    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Payslip Generated",
          message: `Your payslip for ${month}/${year} is ready (Net: SAR ${netPay})`,
          type: "payslip_generated",
        },
      });
    }

    return this.send(payload);
  }

  /**
   * Send attendance alert (helper)
   */
  static async sendAttendanceAlert(
    employeeId: string,
    employeeName: string,
    email: string,
    status: "late" | "absent" | "on-time",
    date: string,
    details?: Record<string, any>
  ): Promise<NotificationResult> {
    let type: NotificationType;
    let data: Record<string, any>;

    if (status === "late") {
      type = "late_arrival";
      data = {
        employeeName,
        date,
        lateMinutes: details?.lateMinutes || 0,
        shiftStart: details?.shiftStart || "N/A",
      };
    } else if (status === "absent") {
      type = "absent_alert";
      data = { employeeName, date };
    } else {
      return { success: false, emailSent: false, smsSent: false };
    }

    const payload: NotificationPayload = {
      type,
      recipient: { name: employeeName, email },
      data,
      sendEmail: true,
      sendSms: status === "absent",
    };

    // Also create in-app notification
    const user = await prisma.user.findFirst({
      where: { employee: { id: employeeId } },
    });

    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title:
            status === "late"
              ? "Late Arrival"
              : status === "absent"
                ? "Absence Alert"
                : "Attendance Recorded",
          message:
            status === "late"
              ? `You arrived ${details?.lateMinutes} minutes late on ${date}`
              : `You were marked absent on ${date}`,
          type,
        },
      });
    }

    return this.send(payload);
  }

  /**
   * Send document expiry alert (helper)
   */
  static async sendDocumentExpiryAlert(
    employeeId: string,
    employeeName: string,
    email: string,
    documentName: string,
    expiryDate: string
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: "document_expiry",
      recipient: { name: employeeName, email },
      data: { employeeName, documentName, expiryDate },
      sendEmail: true,
      sendSms: true,
    };

    // Also create in-app notification
    const user = await prisma.user.findFirst({
      where: { employee: { id: employeeId } },
    });

    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Document Expiry Alert",
          message: `${documentName} will expire on ${expiryDate}`,
          type: "document_expiry",
        },
      });
    }

    return this.send(payload);
  }

  /**
   * Send compliance alert (helper)
   */
  static async sendComplianceAlert(
    companyId: string,
    employeeName: string,
    email: string,
    message: string
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: "compliance_alert",
      recipient: { name: employeeName, email },
      data: { employeeName, message },
      sendEmail: true,
    };

    return this.send(payload);
  }

  /**
   * Send batch notifications
   */
  static async sendBatch(
    payloads: NotificationPayload[]
  ): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }
}

export default EmailNotificationService;
