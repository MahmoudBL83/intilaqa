import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // App Settings
  await prisma.appSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      appArabicName: "انطلاقة",
      appEnglishName: "Intilaqa",
      primaryColor: "#3a6758",
      defaultLanguage: "ar",
    },
  });

  // Roles (sequential to avoid PgBouncer pool saturation)
  const roleDefs = [
    { name: "admin", id: "role_admin", description: "Super Admin - Full system access" },
    { name: "client", id: "role_client", description: "Client / Tenant owner" },
    { name: "company_admin", id: "role_company_admin", description: "Company manager" },
    { name: "employee", id: "role_employee", description: "Regular employee" },
  ];
  const roles = [];
  for (const r of roleDefs) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { id: r.id, name: r.name, description: r.description },
    });
    roles.push(role);
  }

  console.log("Roles created:", roles.map((r) => r.name).join(", "));

  // Permissions (sequential to avoid PgBouncer pool saturation)
  const permDefs: { key: string; id: string; description: string }[] = [
    { key: "manage_clients", id: "perm_manage_clients", description: "Create, update, delete clients" },
    { key: "manage_companies", id: "perm_manage_companies", description: "Create, update, delete companies" },
    { key: "manage_employees", id: "perm_manage_employees", description: "Create, update, delete employees" },
    { key: "manage_users", id: "perm_manage_users", description: "Manage user accounts" },
    { key: "manage_roles", id: "perm_manage_roles", description: "Manage roles and permissions" },
    { key: "manage_subscriptions", id: "perm_manage_subscriptions", description: "Manage subscription plans" },
    { key: "manage_attendance", id: "perm_manage_attendance", description: "Manage attendance records" },
    { key: "manage_payroll", id: "perm_manage_payroll", description: "Manage payroll" },
    { key: "manage_settings", id: "perm_manage_settings", description: "Manage system settings" },
    { key: "view_reports", id: "perm_view_reports", description: "View reports and analytics" },
    { key: "employee_self_service", id: "perm_employee_self_service", description: "Employee self-service access" },
  ];
  const permissions = [];
  for (const def of permDefs) {
    const perm = await prisma.permission.upsert({ where: { key: def.key }, update: {}, create: def });
    permissions.push(perm);
  }

  // Assign all permissions to admin role
  const adminRole = roles[0]!;
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Super Admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@intilaqa.com" },
    update: {},
    create: {
      id: "user_admin",
      email: "admin@intilaqa.com",
      passwordHash,
      name: "Super Admin",
      role: "admin",
    },
  });

  // Demo Client
  const demoClient = await prisma.client.upsert({
    where: { id: "client_demo" },
    update: {},
    create: {
      id: "client_demo",
      name: "شركة النموذجية",
      domain: "demo",
      contactEmail: "demo@example.com",
    },
  });

  // Demo Client User
  const clientUser = await prisma.user.upsert({
    where: { email: "client@intilaqa.com" },
    update: {},
    create: {
      id: "user_client_demo",
      email: "client@intilaqa.com",
      passwordHash,
      name: "خالد العميل",
      role: "client",
    },
  });

  await prisma.client.update({
    where: { id: demoClient.id },
    data: { userId: clientUser.id },
  });

  // Demo Company
  const demoCompany = await prisma.company.upsert({
    where: { id: "company_demo" },
    update: {},
    create: {
      id: "company_demo",
      name: "الفرع الرئيسي",
      address: "الرياض، المملكة العربية السعودية",
      industry: "تقنية المعلومات",
      clientId: demoClient.id,
    },
  });

  // Demo Company Admin User
  const companyAdminUser = await prisma.user.upsert({
    where: { email: "company@intilaqa.com" },
    update: {},
    create: {
      id: "user_company_admin_demo",
      email: "company@intilaqa.com",
      passwordHash,
      name: "سارة المديرة",
      role: "company_admin",
    },
  });

  // Demo Department
  const demoDept = await prisma.department.upsert({
    where: { id: "dept_demo" },
    update: {},
    create: {
      id: "dept_demo",
      name: "قسم تقنية المعلومات",
      companyId: demoCompany.id,
    },
  });

  // Demo Company Admin Employee Record
  await prisma.employee.upsert({
    where: { userId: companyAdminUser.id },
    update: {},
    create: {
      id: "emp_company_admin",
      employeeId: "ADM001",
      position: "مدير الشركة",
      salary: 25000,
      joinDate: new Date("2024-01-01"),
      userId: companyAdminUser.id,
      companyId: demoCompany.id,
      departmentId: demoDept.id,
    },
  });

  // Demo Employee
  const demoUser = await prisma.user.upsert({
    where: { email: "employee@intilaqa.com" },
    update: {},
    create: {
      id: "user_employee_demo",
      email: "employee@intilaqa.com",
      passwordHash,
      name: "أحمد محمد",
      role: "employee",
    },
  });

  await prisma.employee.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      id: "emp_demo",
      employeeId: "EMP001",
      position: "مطور برمجيات",
      salary: 15000,
      joinDate: new Date("2024-01-15"),
      userId: demoUser.id,
      companyId: demoCompany.id,
      departmentId: demoDept.id,
    },
  });

  // Demo Subscription Plan
  const demoPlan = await prisma.subscriptionPlan.upsert({
    where: { id: "plan_basic" },
    update: {},
    create: {
      id: "plan_basic",
      name: "الباقة الأساسية",
      description: "خطة اشتراك أساسية للشركات الصغيرة",
      price: 299,
      features: ["attendance", "payroll", "requests", "documents", "tasks", "reports"],
      isActive: true,
    },
  });

  await prisma.subscription.upsert({
    where: { id: "sub_demo" },
    update: {},
    create: {
      id: "sub_demo",
      clientId: demoClient.id,
      planId: demoPlan.id,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-01-01"),
      status: "active",
    },
  });

  console.log("✅ Base seeding completed!");

  // Run extended seeding if available
  try {
    console.log("\n📦 Loading extended seed data...");
    const { seedExtendedData } = require("./seed-extended");
    await seedExtendedData();
  } catch (error) {
    console.warn("⚠️  Extended seed not available or already run, skipping...");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
