export const WebhookEvents = {
  CLIENT_CREATED: "client.created",
  CLIENT_UPDATED: "client.updated",
  CLIENT_DELETED: "client.deleted",
  COMPANY_CREATED: "company.created",
  COMPANY_UPDATED: "company.updated",
  EMPLOYEE_CREATED: "employee.created",
  EMPLOYEE_UPDATED: "employee.updated",
  ATTENDANCE_CHECK_IN: "attendance.check_in",
  ATTENDANCE_CHECK_OUT: "attendance.check_out",
  REQUEST_CREATED: "request.created",
  REQUEST_APPROVED: "request.approved",
  REQUEST_REJECTED: "request.rejected",
  PAYSLIP_GENERATED: "payslip.generated",
  COMPLIANCE_ALERT: "compliance.alert",
} as const;

export type WebhookEventType = (typeof WebhookEvents)[keyof typeof WebhookEvents];
