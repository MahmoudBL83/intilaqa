import type { AllRoles } from "./roles";

export type Role = "admin" | "client" | "company_admin" | "employee";
export type FutureRole = "accountant" | "hr_manager" | "branch_manager" | "payroll_manager";

export type Language = "ar" | "en";

export type SubscriptionStatus = "active" | "expired" | "trial" | "cancelled";

export type RequestStatus = "pending" | "approved" | "rejected";

export type AttendanceStatus = "present" | "absent" | "late" | "on_leave" | "half_day";

export type PayrollStatus = "draft" | "pending" | "paid";

export type TaskStatus = "todo" | "in_progress" | "done";

export type DocumentStatus = "active" | "expired" | "missing";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
