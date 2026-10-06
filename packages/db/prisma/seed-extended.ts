/**
 * Extended Seed Data for Comprehensive Testing
 * This file extends the base seed with realistic mock data for:
 * - Multiple employees (Saudi & Expat mix)
 * - Shifts and schedules
 * - Documents with expiry dates
 * - Violation policies
 * - Payroll records
 * - Attendance records
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedExtendedData() {
  console.log("🌱 Seeding extended mock data...");

  const hash = await bcrypt.hash("admin123", 10);

  // Get demo company
  const company = await prisma.company.findUnique({ where: { id: "company_demo" } });
  if (!company) throw new Error("Demo company not found");

  // ============ NITAQAT COLORS ============
  console.log("📍 Updating company Nitaqat color...");
  await prisma.company.update({
    where: { id: company.id },
    data: {
      saudizationPercent: 65,
      nitaqatColor: "GREEN_HIGH",
    },
  });

  // ============ SHIFTS ============
  console.log("⏰ Creating shifts...");
  const shiftDefs = [
    { id: "shift_morning", name: "الفترة الصباحية", type: "fixed", startTime: "08:00", endTime: "16:00" },
    { id: "shift_afternoon", name: "الفترة المسائية", type: "fixed", startTime: "14:00", endTime: "22:00" },
    { id: "shift_night", name: "الفترة الليلية", type: "night", startTime: "22:00", endTime: "06:00" },
  ];
  const shifts = [];
  for (const s of shiftDefs) {
    const shift = await prisma.shift.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, workingDays: 5, breakMinutes: 60, companyId: company.id },
    });
    shifts.push(shift);
  }

  console.log(`✅ Created ${shifts.length} shifts`);

  // ============ EMPLOYEES - SAUDI & EXPAT MIX ============
  console.log("👥 Creating diverse employee base...");

  const dept = await prisma.department.findFirst({ where: { companyId: company.id } });
  if (!dept) throw new Error("Department not found");

  const employees = [];
  const saudiNationalities = ["السعودية", "السعودية", "السعودية", "السعودية", "السعودية"];
  const expatNationalities = ["الهند", "الفلبين", "باكستان", "مصر"];

  // Saudi employees
  for (let i = 1; i <= 5; i++) {
    const email = `saudi_emp_${i}@intilaqa.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash,
        name: `موظف سعودي ${i}`,
        role: "employee",
      },
    });

    const emp = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        employeeId: `SAU${String(i).padStart(3, "0")}`,
        position: i <= 2 ? "مطور برمجيات" : i <= 4 ? "محاسب" : "مدير مشروع",
        salary: 12000 + i * 2000,
        joinDate: new Date(2023, 0, i),
        userId: user.id,
        companyId: company.id,
        departmentId: dept.id,
        isSaudi: true,
        nationality: "السعودية",
        contractStartDate: new Date(2023, 0, i),
        contractEndDate: new Date(2027, 0, i),
      },
    });
    employees.push(emp);
  }

  // Expat employees
  for (let i = 1; i <= 4; i++) {
    const email = `expat_emp_${i}@intilaqa.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash,
        name: `موظف وافد ${i}`,
        role: "employee",
      },
    });

    const emp = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        employeeId: `EXP${String(i).padStart(3, "0")}`,
        position: i <= 2 ? "مهندس كهرباء" : "فني صيانة",
        salary: 8000 + i * 1500,
        joinDate: new Date(2023, 6, i),
        userId: user.id,
        companyId: company.id,
        departmentId: dept.id,
        isSaudi: false,
        nationality: expatNationalities[i - 1],
        contractStartDate: new Date(2023, 6, i),
        contractEndDate: new Date(2026, 6, i),
      },
    });
    employees.push(emp);
  }

  console.log(`✅ Created ${employees.length} employees (5 Saudi, 4 Expat)`);

  // ============ VIOLATION POLICIES ============
  console.log("⚠️ Creating violation policies (36+ rules)...");
  const policyData: { id: string; name: string; description: string; deductionType: string; deductionValue: number; companyId: string }[] = [
    // ── ATTENDANCE: Late ──
    { id: "policy_late_5min",      name: "تأخر 5 دقائق",       description: "خصم عن التأخر حتى 5 دقائق", deductionType: "FIXED", deductionValue: 25, companyId: company.id },
    { id: "policy_late_10min",     name: "تأخر 10 دقائق",      description: "خصم عن التأخر حتى 10 دقائق", deductionType: "FIXED", deductionValue: 40, companyId: company.id },
    { id: "policy_late_15min",     name: "تأخر 15 دقيقة",      description: "خصم عن التأخر حتى 15 دقيقة", deductionType: "FIXED", deductionValue: 50, companyId: company.id },
    { id: "policy_late_20min",     name: "تأخر 20 دقيقة",      description: "خصم عن التأخر حتى 20 دقيقة", deductionType: "FIXED", deductionValue: 75, companyId: company.id },
    { id: "policy_late_30min",     name: "تأخر 30 دقيقة",      description: "خصم عن التأخر حتى 30 دقيقة", deductionType: "FIXED", deductionValue: 100, companyId: company.id },
    { id: "policy_late_45min",     name: "تأخر 45 دقيقة",      description: "خصم عن التأخر حتى 45 دقيقة", deductionType: "FIXED", deductionValue: 150, companyId: company.id },
    { id: "policy_late_60min",     name: "تأخر ساعة",          description: "خصم عن التأخر لمدة ساعة كاملة", deductionType: "FIXED", deductionValue: 200, companyId: company.id },
    { id: "policy_late_90min_plus",name: "تأخر ساعة ونصف فأكثر", description: "خصم عن التأخر لمدة ساعة ونصف أو أكثر", deductionType: "PERCENTAGE", deductionValue: 10, companyId: company.id },
    // ── ATTENDANCE: Absence ──
    { id: "policy_absent_half_day",  name: "غياب نصف يوم",       description: "خصم عن الغياب لنصف يوم بدون عذر", deductionType: "FIXED", deductionValue: 250, companyId: company.id },
    { id: "policy_absent_day",       name: "غياب يوم كامل",      description: "خصم عن الغياب ليوم واحد بدون عذر", deductionType: "FIXED", deductionValue: 500, companyId: company.id },
    { id: "policy_absent_2days",     name: "غياب يومين متتاليين", description: "خصم عن الغياب ليومين متتاليين بدون عذر", deductionType: "FIXED", deductionValue: 1000, companyId: company.id },
    { id: "policy_absent_3days",     name: "غياب 3 أيام",         description: "خصم عن الغياب لثلاثة أيام متتالية بدون عذر", deductionType: "FIXED", deductionValue: 1500, companyId: company.id },
    { id: "policy_absent_5days",     name: "غياب 5 أيام",         description: "خصم عن الغياب لخمسة أيام بدون عذر", deductionType: "FIXED", deductionValue: 2500, companyId: company.id },
    { id: "policy_no_show",          name: "انقطاع عن العمل",     description: "خصم عن الانقطاع عن العمل بدون إشعار مسبق", deductionType: "PERCENTAGE", deductionValue: 20, companyId: company.id },
    // ── ATTENDANCE: Other ──
    { id: "policy_early_leave",    name: "خروج مبكر",            description: "خصم عن الخروج قبل نهاية الدوام بدون إذن", deductionType: "FIXED", deductionValue: 50, companyId: company.id },
    { id: "policy_extended_break", name: "تمديد فترة الاستراحة", description: "خصم عن تجاوز وقت الاستراحة المحدد", deductionType: "FIXED", deductionValue: 60, companyId: company.id },
    { id: "policy_missed_checkin", name: "عدم تسجيل الدخول",     description: "خصم عن عدم تسجيل بصمة الحضور عند الدخول", deductionType: "FIXED", deductionValue: 40, companyId: company.id },
    { id: "policy_missed_checkout",name: "عدم تسجيل الخروج",     description: "خصم عن عدم تسجيل بصمة الانصراف", deductionType: "FIXED", deductionValue: 40, companyId: company.id },
    // ── CONDUCT ──
    { id: "policy_uniform",        name: "الزي غير النظامي",        description: "خصم عن عدم الالتزام بالزي الرسمي للعمل", deductionType: "FIXED", deductionValue: 100, companyId: company.id },
    { id: "policy_phone",          name: "استخدام الهاتف",          description: "خصم عن استخدام الهاتف الشخصي أثناء ساعات العمل", deductionType: "FIXED", deductionValue: 75, companyId: company.id },
    { id: "policy_smoking",        name: "التدخين خارج الأماكن المخصصة", description: "خصم عن التدخين في غير الأماكن المسموح بها", deductionType: "FIXED", deductionValue: 150, companyId: company.id },
    { id: "policy_eating",         name: "تناول الطعام في مكان العمل",  description: "خصم عن تناول الطعام خارج أوقات الاستراحة", deductionType: "FIXED", deductionValue: 50, companyId: company.id },
    { id: "policy_sleeping",       name: "النوم أثناء العمل",          description: "خصم عن النوم خلال ساعات الدوام", deductionType: "FIXED", deductionValue: 300, companyId: company.id },
    { id: "policy_fighting",       name: "الشجار أو المشاجرة",        description: "خصم عن الدخول في شجار أو مشاجرة داخل مقر العمل", deductionType: "PERCENTAGE", deductionValue: 15, companyId: company.id },
    { id: "policy_verbal_abuse",   name: "الإساءة اللفظية",           description: "خصم عن التلفظ بألفاظ غير لائقة مع الزملاء أو العملاء", deductionType: "FIXED", deductionValue: 500, companyId: company.id },
    { id: "policy_insubordination",name: "عدم الامتثال للتعليمات",    description: "خصم عن عدم تنفيذ التعليمات المباشرة من المدير المباشر", deductionType: "PERCENTAGE", deductionValue: 10, companyId: company.id },
    { id: "policy_gossip",         name: "نشر الشائعات",              description: "خصم عن التحدث بسوء عن الزملاء أو نشر الشائعات", deductionType: "FIXED", deductionValue: 250, companyId: company.id },
    { id: "policy_unauth_visitor", name: "استقبال زوار غير مصرح لهم", description: "خصم عن إدخال زوار أو مرافقين بدون تصريح", deductionType: "FIXED", deductionValue: 200, companyId: company.id },
    // ── PERFORMANCE ──
    { id: "policy_missed_target",  name: "عدم تحقيق الهدف الشهري",    description: "خصم عن عدم تحقيق أهداف الأداء الشهرية المطلوبة", deductionType: "PERCENTAGE", deductionValue: 5, companyId: company.id },
    { id: "policy_work_error",     name: "خطأ في العمل",              description: "خصم عن ارتكاب خطأ أدى إلى خسارة أو ضرر", deductionType: "FIXED", deductionValue: 300, companyId: company.id },
    { id: "policy_negligence",     name: "الإهمال في أداء المهام",    description: "خصم عن الإهمال المتكرر في تنفيذ المهام المسندة", deductionType: "FIXED", deductionValue: 400, companyId: company.id },
    { id: "policy_missed_deadline",name: "تجاوز الموعد النهائي",      description: "خصم عن عدم تسليم العمل في الموعد المحدد", deductionType: "FIXED", deductionValue: 200, companyId: company.id },
    { id: "policy_unreported_abs", name: "غياب غير مبلغ عنه",         description: "خصم عن الغياب دون إبلاغ مسبق لمدير القسم", deductionType: "FIXED", deductionValue: 600, companyId: company.id },
    { id: "policy_late_report",    name: "تأخير رفع التقارير",        description: "خصم عن التأخر في تقديم التقارير الدورية", deductionType: "FIXED", deductionValue: 150, companyId: company.id },
    // ── SAFETY ──
    { id: "policy_safety_ppe",        name: "عدم ارتداء مهمات السلامة",     description: "خصم عن عدم استخدام معدات الوقاية الشخصية", deductionType: "FIXED", deductionValue: 300, companyId: company.id },
    { id: "policy_safety_violation",  name: "مخالفة إجراءات السلامة",       description: "خصم عن تجاوز قواعد وإجراءات السلامة المهنية", deductionType: "FIXED", deductionValue: 500, companyId: company.id },
    { id: "policy_safety_unsafe_act", name: "سلوك غير آمن",                  description: "خصم عن القيام بسلوك يعرض سلامة الموظفين للخطر", deductionType: "FIXED", deductionValue: 750, companyId: company.id },
    { id: "policy_safety_exit_block", name: "إغلاق مخارج الطوارئ",           description: "خصم عن إغلاق أو إعاقة مخارج الطوارئ", deductionType: "FIXED", deductionValue: 1000, companyId: company.id },
    { id: "policy_safety_extinguisher",name: "العبث بطفايات الحريق",         description: "خصم عن العبث أو استخدام طفايات الحريق لغير الغرض المخصص", deductionType: "FIXED", deductionValue: 800, companyId: company.id },
    // ── DOCUMENTS ──
    { id: "policy_expired_iqama",      name: "انتهاء الإقامة",          description: "خصم عن عدم تجديد الإقامة قبل انتهائها بشهر", deductionType: "FIXED", deductionValue: 300, companyId: company.id },
    { id: "policy_expired_passport",   name: "انتهاء جواز السفر",       description: "خصم عن عدم تجديد جواز السفر في الوقت المحدد", deductionType: "FIXED", deductionValue: 200, companyId: company.id },
    { id: "policy_expired_license",    name: "انتهاء رخصة العمل",       description: "خصم عن عدم تجديد رخصة العمل المهنية", deductionType: "FIXED", deductionValue: 250, companyId: company.id },
    { id: "policy_expired_prof_cert",  name: "انتهاء الشهادة المهنية",  description: "خصم عن عدم تجديد الشهادة المهنية المطلوبة للوظيفة", deductionType: "FIXED", deductionValue: 200, companyId: company.id },
  ];

  const policies = [];
  for (const p of policyData) {
    const policy = await prisma.violationPolicy.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
    policies.push(policy);
  }

  console.log(`✅ Created ${policies.length} violation policies`);

  // ============ EMPLOYEE VIOLATIONS ============
  console.log("📋 Recording employee violations...");
  for (let i = 0; i < employees.length; i++) {
    const violationCount = Math.floor(Math.random() * 3) + 1;
    for (let v = 0; v < violationCount; v++) {
      const policy = policies[Math.floor(Math.random() * policies.length)]!;
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const violationDate = new Date();
      violationDate.setDate(violationDate.getDate() - daysAgo);

      await prisma.employeeViolation.create({
        data: {
          employeeId: employees[i]!.id,
          policyId: policy.id,
          date: violationDate,
          status: Math.random() > 0.3 ? "applied" : "pending",
        },
      });
    }
  }

  console.log(`✅ Created violations for all employees`);

  // ============ DOCUMENTS WITH EXPIRY DATES ============
  console.log("📄 Creating documents with expiry alerts...");

  const today = new Date();
  const docs30 = new Date();
  docs30.setDate(docs30.getDate() + 28);
  const docs60 = new Date();
  docs60.setDate(docs60.getDate() + 58);
  const docs90 = new Date();
  docs90.setDate(docs90.getDate() + 88);
  const docsExpired = new Date();
  docsExpired.setDate(docsExpired.getDate() - 5);

  const emp0Id = employees[0]!.id;
  const emp1Id = employees[1]!.id;

  const companyDocs = [
    { id: "doc_cr_expiring", name: "السجل التجاري", type: "COMMERCIAL_REGISTRATION", url: "s3://docs/cr-123.pdf", companyId: company.id, expiryDate: docs30 },
    { id: "doc_zakat_expiring", name: "شهادة الزكاة", type: "ZAKAT_CERTIFICATE", url: "s3://docs/zakat-123.pdf", companyId: company.id, expiryDate: docs60 },
    { id: "doc_license_expiring", name: "رخصة البلدية", type: "MUNICIPALITY_LICENSE", url: "s3://docs/license-123.pdf", companyId: company.id, expiryDate: docs90 },
    { id: "doc_iqama_emp1", name: "الإقامة", type: "IQAMA", url: "s3://docs/iqama-emp1.pdf", employeeId: emp0Id, expiryDate: docs30 },
    { id: "doc_passport_emp1", name: "جواز السفر", type: "PASSPORT", url: "s3://docs/passport-emp1.pdf", employeeId: emp0Id, expiryDate: docs60 },
    { id: "doc_expired", name: "رخصة قديمة", type: "LICENSE", url: "s3://docs/old-license.pdf", status: "expired", employeeId: emp1Id, expiryDate: docsExpired },
  ];
  const documents = [];
  for (const d of companyDocs) {
    const doc = await prisma.document.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        name: d.name,
        type: d.type,
        url: d.url,
        status: "status" in d ? (d as { status: string }).status : "active",
        companyId: "companyId" in d ? (d as { companyId: string }).companyId : undefined,
        employeeId: "employeeId" in d ? (d as { employeeId: string }).employeeId : undefined,
        expiryDate: d.expiryDate,
      },
    });
    documents.push(doc);
  }

  console.log(`✅ Created ${documents.length} documents with expiry alerts`);

  // ============ PAYROLL RECORDS ============
  console.log("💰 Creating payroll records...");
  const payrollRecords = [];

  const totalBaseSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const totalAllowances = 2000;
  const totalDeductions = 1500;

  for (let month = 2; month <= 4; month++) {
    const record = await prisma.payrollRecord.upsert({
      where: { id: `payroll_${month}` },
      update: {},
      create: {
        id: `payroll_${month}`,
        month,
        year: 2026,
        baseSalary: totalBaseSalary,
        allowances: totalAllowances,
        deductions: totalDeductions,
        netPay: totalBaseSalary + totalAllowances - totalDeductions,
        status: month < 4 ? "completed" : "draft",
        companyId: company.id,
      },
    });
    payrollRecords.push(record);
  }

  console.log(`✅ Created ${payrollRecords.length} payroll records`);

  // ============ ATTENDANCE RECORDS ============
  console.log("📅 Creating attendance records...");
  const attendanceRecords = [];

  // Create attendance for last 5 days (reduce to avoid pooler timeout)
  for (let day = 5; day >= 1; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    for (const emp of employees) {
      if (Math.random() > 0.2) {
        const checkInHour = Math.floor(Math.random() * 2) + 8;
        const checkInMin = Math.floor(Math.random() * 60);
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMin, 0, 0);

        const checkOutHour = Math.floor(Math.random() * 2) + 16;
        const checkOutMin = Math.floor(Math.random() * 60);
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMin, 0, 0);

        const status = checkIn.getHours() > 8 || (checkIn.getHours() === 8 && checkIn.getMinutes() > 15)
          ? "late"
          : "present";

        // Use createMany for efficiency; skip if already exists via upsert
        try {
          await prisma.attendanceRecord.create({
            data: {
              id: `att_${emp.id}_${date.getTime()}`,
              date,
              checkIn,
              checkOut,
              status,
              employeeId: emp.id,
            },
          });
          attendanceRecords.push(1);
        } catch {
          // Record already exists, skip
        }
      }
    }
  }

  console.log(`✅ Created ${attendanceRecords.length} attendance records`);

  // ============ PAYSLIPS ============
  console.log("📋 Creating payslips...");
  for (const payroll of payrollRecords) {
    for (const emp of employees) {
      const payslipId = `payslip_${emp.id}_${payroll.month}`;
      await prisma.payslip.upsert({
        where: { id: payslipId },
        update: {},
        create: {
          id: payslipId,
          payrollRecordId: payroll.id,
          employeeId: emp.id,
        },
      });
    }
  }

  console.log(`✅ Created payslips for all employees`);

  // ============ SUBSCRIPTION DATA (already in base seed, upsert to be safe) ============
  console.log("📊 Ensuring subscription data...");
  await prisma.subscription.upsert({
    where: { id: "sub_demo" },
    update: {},
    create: {
      id: "sub_demo",
      startDate: new Date(2025, 0, 1),
      endDate: new Date(2026, 0, 1),
      status: "active",
      clientId: "client_demo",
      planId: "plan_basic",
    },
  });

  console.log(`✅ Subscription verified`);

  // ============ API KEYS ============
  console.log("🔑 Creating demo API key...");
  await prisma.apiKey.upsert({
    where: { id: "apikey_demo" },
    update: {},
    create: {
      id: "apikey_demo",
      name: "Demo Integration Key",
      key: "intilaqa_demo1234567890abcdef1234567890abcdef1234567890",
      prefix: "intilaqa_de",
      clientId: "client_demo",
      permissions: ["*"],
      isActive: true,
    },
  });
  console.log("✅ API key verified");

  // ============ PROFESSIONAL CERTIFICATES ============
  console.log("🎓 Creating professional certificates...");
  const certData = [
    { name: "شهادة مهندس برمجيات معتمد", profession: "مهندس برمجيات", qiwaProfessionCode: "SWE-001", employeeIdx: 0, expiryDays: 365 },
    { name: "شهادة محاسب قانوني", profession: "محاسب", qiwaProfessionCode: "CPA-001", employeeIdx: 2, expiryDays: 180 },
    { name: "شهادة إدارة مشاريع احترافية PMP", profession: "مدير مشروع", qiwaProfessionCode: "PMP-001", employeeIdx: 4, expiryDays: 90 },
    { name: "شهادة كهربائي معتمد", profession: "فني كهرباء", qiwaProfessionCode: "ELC-001", employeeIdx: 5, expiryDays: 30 },
    { name: "شهادة صيانة صناعية", profession: "فني صيانة", qiwaProfessionCode: "MNT-001", employeeIdx: 7, expiryDays: 14 },
    { name: "شهادة سلامة مهنية", profession: "مسؤول سلامة", qiwaProfessionCode: "SAF-001", employeeIdx: 1, expiryDays: 200 },
  ];
  for (const cd of certData) {
    const exp = new Date();
    exp.setDate(exp.getDate() + cd.expiryDays);
    const issue = new Date();
    issue.setFullYear(issue.getFullYear() - 1);
    await prisma.professionalCertificate.upsert({
      where: { id: `pcert_${cd.employeeIdx}` },
      update: {},
      create: {
        id: `pcert_${cd.employeeIdx}`,
        name: cd.name,
        certificateNumber: `CERT-${2025 + cd.employeeIdx}-${cd.employeeIdx}000`,
        issuingAuthority: "الهيئة السعودية للمهندسين",
        issueDate: issue,
        expiryDate: exp,
        profession: cd.profession,
        qiwaProfessionCode: cd.qiwaProfessionCode,
        isVerified: cd.employeeIdx % 2 === 0,
        employeeId: employees[cd.employeeIdx]!.id,
        companyId: company.id,
      },
    });
  }
  console.log(`✅ Created ${certData.length} professional certificates`);

  // ============ COMPLIANCE ALERTS ============
  console.log("🔔 Generating compliance alerts...");
  const complianceDocs = await prisma.complianceDocument.findMany({
    where: { companyId: company.id },
  });

  if (complianceDocs.length === 0) {
    // Company compliance documents (4)
    const companyCompDocs = [
      { id: "cdoc_cr", name: "السجل التجاري", type: "COMMERCIAL_REGISTRATION", documentNumber: "CR-123456", issuingAuthority: "وزارة التجارة", ownerType: "company", ownerId: company.id, expiryDate: docs30 },
      { id: "cdoc_zakat", name: "شهادة الزكاة والدخل", type: "ZAKAT_CERTIFICATE", documentNumber: "ZAK-789012", issuingAuthority: "هيئة الزكاة والضريبة", ownerType: "company", ownerId: company.id, expiryDate: docs60 },
      { id: "cdoc_license", name: "رخصة البلدية", type: "MUNICIPALITY_LICENSE", documentNumber: "MUN-345678", issuingAuthority: "أمانة المنطقة", ownerType: "company", ownerId: company.id, expiryDate: docs90 },
      { id: "cdoc_chamber", name: "شهادة الغرفة التجارية", type: "CHAMBER_CERTIFICATE", documentNumber: "CHM-901234", issuingAuthority: "الغرفة التجارية", ownerType: "company", ownerId: company.id, expiryDate: docs90 },
    ];

    // Employee compliance documents — docs for expat employees (employees 5-8, 0-indexed: idx 5,6,7,8 are expats)
    const empCompDocs = [];
    for (let i = 0; i < employees.length; i++) {
      if (!employees[i]!.isSaudi) {
        const empIdx = i + 1;
        empCompDocs.push(
          { id: `cdoc_iqama_emp${empIdx}`, name: "الإقامة", type: "IQAMA", documentNumber: `IQ-${empIdx}00001`, issuingAuthority: "الجوازات", ownerType: "employee", ownerId: employees[i]!.id, expiryDate: docs30 },
          { id: `cdoc_passport_emp${empIdx}`, name: "جواز السفر", type: "PASSPORT", documentNumber: `PP-${empIdx}00001`, issuingAuthority: "الجوازات", ownerType: "employee", ownerId: employees[i]!.id, expiryDate: docs60 },
          { id: `cdoc_worklicense_emp${empIdx}`, name: "رخصة العمل", type: "WORK_LICENSE", documentNumber: `WL-${empIdx}00001`, issuingAuthority: "وزارة العمل", ownerType: "employee", ownerId: employees[i]!.id, expiryDate: docs90 },
        );
      } else {
        // Saudi employees get professional certificates
        const empIdx = i + 1;
        empCompDocs.push(
          { id: `cdoc_profcert_emp${empIdx}`, name: "شهادة مهنية", type: "PROFESSIONAL_CERTIFICATE", documentNumber: `PC-${empIdx}00001`, issuingAuthority: "هيئة المهندسين", ownerType: "employee", ownerId: employees[i]!.id, expiryDate: docs90 },
        );
      }
    }

    const allCompDocs = [...companyCompDocs, ...empCompDocs];
    for (const cd of allCompDocs) {
      await prisma.complianceDocument.upsert({
        where: { id: cd.id },
        update: {},
        create: { ...cd, companyId: company.id },
      });
    }

    console.log(`   Created ${allCompDocs.length} compliance documents`);

    // Generate alerts from expiry dates
    const allDocs = await prisma.complianceDocument.findMany({
      where: { companyId: company.id },
    });

    let alertCount = 0;
    for (const doc of allDocs) {
      if (doc.expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (doc.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        let alertLevel = "90_days";
        let severity = "low";
        if (daysUntilExpiry < 0) {
          alertLevel = "expired";
          severity = "critical";
        } else if (daysUntilExpiry <= 30) {
          alertLevel = "30_days";
          severity = "high";
        } else if (daysUntilExpiry <= 60) {
          alertLevel = "60_days";
          severity = "medium";
        }

        const alertId = `alert_${doc.id}`;
        await prisma.complianceAlert.upsert({
          where: { id: alertId },
          update: {},
          create: {
            id: alertId,
            type: "document_expiry",
            title: `تنبيه: ${doc.name} ${daysUntilExpiry < 0 ? "منتهي الصلاحية" : `سينتهي خلال ${daysUntilExpiry} يوم`}`,
            description: `المستند ${doc.name} رقم ${doc.documentNumber || "—"} ${daysUntilExpiry < 0 ? `انتهت صلاحيته منذ ${Math.abs(daysUntilExpiry)} يوم` : `تنتهي صلاحيته بتاريخ ${doc.expiryDate.toLocaleDateString("ar-SA")}`}`,
            alertLevel,
            severity,
            channel: "dashboard",
            status: "pending",
            ownerType: doc.ownerType,
            ownerId: doc.ownerId,
            dueDate: doc.expiryDate,
            documentId: doc.id,
            companyId: company.id,
          },
        });
        alertCount++;
      }
    }
    console.log(`   Generated ${alertCount} compliance alerts`);
  }

  console.log("✅ Compliance alerts generated");

  console.log("🎉 Extended seeding complete!");
}
