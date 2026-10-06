export const PERMISSIONS = {
  // Clients
  MANAGE_CLIENTS: "manage_clients",
  VIEW_CLIENTS: "view_clients",

  // Companies
  MANAGE_COMPANIES: "manage_companies",
  VIEW_COMPANIES: "view_companies",

  // Employees
  MANAGE_EMPLOYEES: "manage_employees",
  VIEW_EMPLOYEES: "view_employees",

  // Users
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",

  // Roles & Permissions
  MANAGE_ROLES: "manage_roles",
  VIEW_ROLES: "view_roles",

  // Subscriptions
  MANAGE_SUBSCRIPTIONS: "manage_subscriptions",
  VIEW_SUBSCRIPTIONS: "view_subscriptions",

  // Attendance
  MANAGE_ATTENDANCE: "manage_attendance",
  VIEW_ATTENDANCE: "view_attendance",
  CHECK_IN_OUT: "check_in_out",

  // Shifts
  MANAGE_SHIFTS: "manage_shifts",
  VIEW_SHIFTS: "view_shifts",

  // Overtime
  MANAGE_OVERTIME: "manage_overtime",
  VIEW_OVERTIME: "view_overtime",

  // Requests
  MANAGE_REQUESTS: "manage_requests",
  VIEW_REQUESTS: "view_requests",
  CREATE_REQUESTS: "create_requests",
  APPROVE_REQUESTS: "approve_requests",

  // Documents
  MANAGE_DOCUMENTS: "manage_documents",
  VIEW_DOCUMENTS: "view_documents",
  UPLOAD_DOCUMENTS: "upload_documents",

  // Compliance
  MANAGE_COMPLIANCE: "manage_compliance",
  VIEW_COMPLIANCE: "view_compliance",

  // Violations
  MANAGE_VIOLATIONS: "manage_violations",
  VIEW_VIOLATIONS: "view_violations",

  // Payroll
  MANAGE_PAYROLL: "manage_payroll",
  VIEW_PAYROLL: "view_payroll",

  // Payslips
  MANAGE_PAYSLIPS: "manage_payslips",
  VIEW_PAYSLIPS: "view_payslips",

  // Tasks
  MANAGE_TASKS: "manage_tasks",
  VIEW_TASKS: "view_tasks",

  // Reports
  MANAGE_REPORTS: "manage_reports",
  VIEW_REPORTS: "view_reports",

  // Saudization
  MANAGE_SAUDIZATION: "manage_saudization",
  VIEW_SAUDIZATION: "view_saudization",

  // Settings
  MANAGE_SETTINGS: "manage_settings",
  VIEW_SETTINGS: "view_settings",

  // Branding
  MANAGE_BRANDING: "manage_branding",

  // Notifications
  MANAGE_NOTIFICATIONS: "manage_notifications",
  VIEW_NOTIFICATIONS: "view_notifications",

  // Self Service
  EMPLOYEE_SELF_SERVICE: "employee_self_service",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

import type { AllRoles } from "./roles";

export const ROLE_PERMISSIONS: Record<AllRoles, Permission[]> = {
  admin: ALL_PERMISSIONS,

  client: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_COMPANIES,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_SUBSCRIPTIONS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_COMPANIES,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  company_admin: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_SHIFTS,
    PERMISSIONS.VIEW_OVERTIME,
    PERMISSIONS.VIEW_REQUESTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.VIEW_PAYSLIPS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_SAUDIZATION,
    PERMISSIONS.VIEW_COMPLIANCE,
    PERMISSIONS.VIEW_VIOLATIONS,
    PERMISSIONS.MANAGE_VIOLATIONS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.MANAGE_ATTENDANCE,
    PERMISSIONS.MANAGE_SHIFTS,
    PERMISSIONS.MANAGE_OVERTIME,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  employee: [
    PERMISSIONS.CHECK_IN_OUT,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.VIEW_PAYSLIPS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.EMPLOYEE_SELF_SERVICE,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  // Future roles — define permissions now for when they go active
  accountant: [
    PERMISSIONS.VIEW_PAYROLL,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.VIEW_PAYSLIPS,
    PERMISSIONS.MANAGE_PAYSLIPS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  hr_manager: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_COMPLIANCE,
    PERMISSIONS.MANAGE_COMPLIANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_REPORTS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  branch_manager: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_SHIFTS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],

  payroll_manager: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.MANAGE_PAYROLL,
    PERMISSIONS.MANAGE_PAYSLIPS,
    PERMISSIONS.VIEW_PAYSLIPS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
  ],
};

export function hasPermission(
  userRole: string,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as AllRoles];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function getRolePermissions(role: string): readonly Permission[] {
  return ROLE_PERMISSIONS[role as AllRoles] || [];
}
