import type { Role, FutureRole } from "./types";

export type AllRoles = Role | FutureRole;

export interface RoleDefinition {
  key: AllRoles;
  labelKey: string;
  description: string;
  dashboardRoute: string;
  isActive: boolean;
}

export const ROLES: Record<AllRoles, RoleDefinition> = {
  admin: {
    key: "admin",
    labelKey: "roles.admin",
    description: "Super Admin — full platform access",
    dashboardRoute: "/admin",
    isActive: true,
  },
  client: {
    key: "client",
    labelKey: "roles.client",
    description: "Client / Tenant owner — own companies and subscriptions",
    dashboardRoute: "/client",
    isActive: true,
  },
  company_admin: {
    key: "company_admin",
    labelKey: "roles.companyAdmin",
    description: "Company manager — employees, attendance, payroll, documents",
    dashboardRoute: "/company",
    isActive: true,
  },
  employee: {
    key: "employee",
    labelKey: "roles.employee",
    description: "Regular employee — personal data, attendance, self-service",
    dashboardRoute: "/employee",
    isActive: true,
  },
  accountant: {
    key: "accountant",
    labelKey: "roles.accountant",
    description: "Accountant — payroll and financial reports",
    dashboardRoute: "/accountant",
    isActive: false,
  },
  hr_manager: {
    key: "hr_manager",
    labelKey: "roles.hrManager",
    description: "HR Manager — employees, requests, documents, compliance",
    dashboardRoute: "/hr-manager",
    isActive: false,
  },
  branch_manager: {
    key: "branch_manager",
    labelKey: "roles.branchManager",
    description: "Branch Manager — branch employees and operations",
    dashboardRoute: "/branch-manager",
    isActive: false,
  },
  payroll_manager: {
    key: "payroll_manager",
    labelKey: "roles.payrollManager",
    description: "Payroll Manager — payroll processing and payslips",
    dashboardRoute: "/payroll-manager",
    isActive: false,
  },
} as const;

export const ACTIVE_ROLES = Object.values(ROLES).filter((r) => r.isActive);

export function getDashboardRoute(role: string): string {
  return ROLES[role as AllRoles]?.dashboardRoute || "/login";
}

export function getRoleLabelKey(role: string): string {
  return ROLES[role as AllRoles]?.labelKey || "roles.unknown";
}
