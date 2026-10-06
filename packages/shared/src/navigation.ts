import type { Role } from "./types";
import type { AllRoles } from "./roles";
import { ROLES } from "./roles";
import { PERMISSIONS } from "./permissions";

export type NavItemKey =
  | "dashboard"
  | "clients"
  | "companies"
  | "employees"
  | "users"
  | "roles"
  | "subscriptions"
  | "attendance"
  | "shifts"
  | "overtime"
  | "requests"
  | "documents"
  | "compliance"
  | "violations"
  | "payroll"
  | "payslips"
  | "tasks"
  | "reports"
  | "saudization"
  | "settings"
  | "branding"
  | "profile"
  | "notifications"
  | "webhooks"
  | "apiKeys"
  | "auditLog"
  | "loans";

export interface NavItemConfig {
  key: NavItemKey;
  i18nKey: string;
  href: string;
  icon: string;
  roles: AllRoles[];
  permission?: string;
}

export interface NavGroupConfig {
  key: string;
  i18nKey: string;
  items: NavItemKey[];
}

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    key: "main",
    i18nKey: "nav.groups.main",
    items: [
      "dashboard",
      "clients",
      "companies",
      "employees",
      "users",
    ],
  },
  {
    key: "management",
    i18nKey: "nav.groups.management",
    items: [
      "roles",
      "subscriptions",
      "attendance",
      "shifts",
      "overtime",
      "requests",
      "documents",
      "compliance",
      "violations",
      "payroll",
      "payslips",
      "tasks",
      "notifications",
      "reports",
      "saudization",
      "webhooks",
      "apiKeys",
      "auditLog",
      "loans",
    ],
  },
  {
    key: "settings",
    i18nKey: "nav.groups.settings",
    items: ["settings", "profile"],
  },
];

export const NAV_ITEMS: Record<NavItemKey, NavItemConfig> = {
  dashboard: {
    key: "dashboard",
    i18nKey: "nav.items.dashboard",
    href: "",
    icon: "LayoutDashboard",
    roles: ["admin", "client", "company_admin", "employee"],
  },
  clients: {
    key: "clients",
    i18nKey: "nav.items.clients",
    href: "/clients",
    icon: "Users",
    roles: ["admin"],
    permission: PERMISSIONS.VIEW_CLIENTS,
  },
  companies: {
    key: "companies",
    i18nKey: "nav.items.companies",
    href: "/companies",
    icon: "Building2",
    roles: ["admin", "client"],
    permission: PERMISSIONS.VIEW_COMPANIES,
  },
  employees: {
    key: "employees",
    i18nKey: "nav.items.employees",
    href: "/employees",
    icon: "UserCheck",
    roles: ["admin", "client", "company_admin"],
    permission: PERMISSIONS.VIEW_EMPLOYEES,
  },
  users: {
    key: "users",
    i18nKey: "nav.items.users",
    href: "/users",
    icon: "ShieldAlert",
    roles: ["admin", "client", "company_admin"],
    permission: PERMISSIONS.VIEW_USERS,
  },
  roles: {
    key: "roles",
    i18nKey: "nav.items.roles",
    href: "/roles",
    icon: "Key",
    roles: ["admin"],
    permission: PERMISSIONS.VIEW_ROLES,
  },
  subscriptions: {
    key: "subscriptions",
    i18nKey: "nav.items.subscriptions",
    href: "/subscriptions",
    icon: "CreditCard",
    roles: ["admin", "client"],
    permission: PERMISSIONS.VIEW_SUBSCRIPTIONS,
  },
  attendance: {
    key: "attendance",
    i18nKey: "nav.items.attendance",
    href: "/attendance",
    icon: "CalendarCheck",
    roles: ["admin", "client", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_ATTENDANCE,
  },
  shifts: {
    key: "shifts",
    i18nKey: "nav.items.shifts",
    href: "/shifts",
    icon: "Clock",
    roles: ["admin", "company_admin"],
    permission: PERMISSIONS.VIEW_SHIFTS,
  },
  overtime: {
    key: "overtime",
    i18nKey: "nav.items.overtime",
    href: "/overtime",
    icon: "Timer",
    roles: ["admin", "company_admin"],
    permission: PERMISSIONS.VIEW_OVERTIME,
  },
  requests: {
    key: "requests",
    i18nKey: "nav.items.requests",
    href: "/requests",
    icon: "FileText",
    roles: ["admin", "client", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_REQUESTS,
  },
  documents: {
    key: "documents",
    i18nKey: "nav.items.documents",
    href: "/documents",
    icon: "FileCheck",
    roles: ["admin", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_DOCUMENTS,
  },
  compliance: {
    key: "compliance",
    i18nKey: "nav.items.compliance",
    href: "/compliance",
    icon: "Shield",
    roles: ["admin", "company_admin"],
    permission: PERMISSIONS.VIEW_COMPLIANCE,
  },
  violations: {
    key: "violations",
    i18nKey: "nav.items.violations",
    href: "/violations",
    icon: "AlertTriangle",
    roles: ["admin", "company_admin"],
    permission: PERMISSIONS.VIEW_VIOLATIONS,
  },
  payroll: {
    key: "payroll",
    i18nKey: "nav.items.payroll",
    href: "/payroll",
    icon: "DollarSign",
    roles: ["admin", "client", "company_admin"],
    permission: PERMISSIONS.VIEW_PAYROLL,
  },
  payslips: {
    key: "payslips",
    i18nKey: "nav.items.payslips",
    href: "/payslips",
    icon: "ReceiptText",
    roles: ["admin", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_PAYSLIPS,
  },
  tasks: {
    key: "tasks",
    i18nKey: "nav.items.tasks",
    href: "/tasks",
    icon: "ClipboardList",
    roles: ["admin", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_TASKS,
  },
  reports: {
    key: "reports",
    i18nKey: "nav.items.reports",
    href: "/reports",
    icon: "BarChart3",
    roles: ["admin", "client", "company_admin"],
    permission: PERMISSIONS.VIEW_REPORTS,
  },
  saudization: {
    key: "saudization",
    i18nKey: "nav.items.saudization",
    href: "/saudization",
    icon: "Globe",
    roles: ["admin", "company_admin"],
    permission: PERMISSIONS.VIEW_SAUDIZATION,
  },
  settings: {
    key: "settings",
    i18nKey: "nav.items.settings",
    href: "/settings",
    icon: "Settings",
    roles: ["admin", "client", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_SETTINGS,
  },
  branding: {
    key: "branding",
    i18nKey: "nav.items.branding",
    href: "/settings",
    icon: "Palette",
    roles: ["admin"],
    permission: PERMISSIONS.MANAGE_BRANDING,
  },
  notifications: {
    key: "notifications",
    i18nKey: "nav.items.notifications",
    href: "/notifications",
    icon: "Bell",
    roles: ["admin", "client", "company_admin", "employee"],
    permission: PERMISSIONS.VIEW_NOTIFICATIONS,
  },
  profile: {
    key: "profile",
    i18nKey: "nav.items.profile",
    href: "/profile",
    icon: "UserCog",
    roles: ["employee"],
    permission: PERMISSIONS.EMPLOYEE_SELF_SERVICE,
  },
  webhooks: {
    key: "webhooks",
    i18nKey: "nav.items.webhooks",
    href: "/webhooks",
    icon: "Webhook",
    roles: ["admin"],
    permission: PERMISSIONS.MANAGE_SETTINGS,
  },
  apiKeys: {
    key: "apiKeys",
    i18nKey: "nav.items.apiKeys",
    href: "/api-keys",
    icon: "Key",
    roles: ["admin"],
    permission: PERMISSIONS.MANAGE_SETTINGS,
  },
  auditLog: {
    key: "auditLog",
    i18nKey: "nav.items.auditLog",
    href: "/audit-log",
    icon: "ScrollText",
    roles: ["admin"],
    permission: PERMISSIONS.VIEW_SETTINGS,
  },
  loans: {
    key: "loans",
    i18nKey: "nav.items.loans",
    href: "/loans",
    icon: "HandCoins",
    roles: ["admin"],
    permission: PERMISSIONS.VIEW_EMPLOYEES,
  },
};

export const ICON_NAMES = {
  LayoutDashboard: "LayoutDashboard",
  Users: "Users",
  Building2: "Building2",
  UserCheck: "UserCheck",
  ShieldAlert: "ShieldAlert",
  Shield: "Shield",
  Key: "Key",
  CreditCard: "CreditCard",
  CalendarCheck: "CalendarCheck",
  Clock: "Clock",
  Timer: "Timer",
  FileText: "FileText",
  FileCheck: "FileCheck",
  DollarSign: "DollarSign",
  ReceiptText: "ReceiptText",
  ClipboardList: "ClipboardList",
  BarChart3: "BarChart3",
  Settings: "Settings",
  Palette: "Palette",
  UserCog: "UserCog",
  Bell: "Bell",
} as const;

export function getRoleNavigation(
  role: string,
  permissions: string[]
): { groupKey: string; groupI18nKey: string; items: NavItemConfig[] }[] {
  const roleDef = ROLES[role as AllRoles];
  if (!roleDef?.isActive) return [];

  return NAV_GROUPS.map((group) => {
    const visibleItems = group.items
      .filter((key) => {
        const item = NAV_ITEMS[key];
        if (!item) return false;
        if (!item.roles.includes(role as AllRoles)) return false;
        if (item.permission && !permissions.includes(item.permission)) return false;
        return true;
      })
      .map((key) => NAV_ITEMS[key]);

    return {
      groupKey: group.key,
      groupI18nKey: group.i18nKey,
      items: visibleItems,
    };
  }).filter((group) => group.items.length > 0);
}
