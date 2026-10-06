import { prisma } from "@intilaqa/db";

export interface AttendanceSummary {
  checkedIn: number;
  late: number;
  absent: number;
  onLeave: number;
  total: number;
  attendanceRate: number;
  lastCheckIn: string | null;
}

export interface DocumentExpiryCount {
  totalExpired: number;
  totalExpiring30: number;
  byType: { type: string; count: number; expired: number; expiring30: number }[];
}

export interface UserAccountSummary {
  totalUsers: number;
  activeUsers: number;
  pendingApproval: number;
  maxAllowed: number;
  remainingSlots: number;
}

export interface UserAccountRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  requiresApproval: boolean;
}

export interface CompanyOperations {
  attendance: AttendanceSummary;
  documents: DocumentExpiryCount;
  users: UserAccountSummary;
  userAccounts: UserAccountRow[];
}

export class OperationsService {
  static async getAttendanceSummary(companyId: string): Promise<AttendanceSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, records] = await Promise.all([
      prisma.employee.count({ where: { companyId, isActive: true } }),
      prisma.attendanceRecord.findMany({
        where: { employee: { companyId }, date: { gte: today, lt: tomorrow } },
        include: { employee: { select: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const checkedIn = records.filter((r) => r.status === "present").length;
    const late = records.filter((r) => r.status === "late").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const onLeave = records.filter((r) => r.status === "on_leave").length;
    const attendanceRate = total > 0 ? Math.round(((checkedIn + late) / total) * 100) : 0;
    const lastCheckIn = records.find((r) => r.checkIn)?.checkIn?.toISOString() ?? null;

    return { checkedIn, late, absent, onLeave, total, attendanceRate, lastCheckIn };
  }

  static async getDocumentExpirySummary(companyId: string): Promise<DocumentExpiryCount> {
    const now = new Date();
    const thirtyDays = new Date(now);
    thirtyDays.setDate(thirtyDays.getDate() + 30);

    const docs = await prisma.complianceDocument.findMany({
      where: { companyId },
    });

    const typeMap = new Map<string, { count: number; expired: number; expiring30: number }>();
    for (const doc of docs) {
      const existing = typeMap.get(doc.type) || { count: 0, expired: 0, expiring30: 0 };
      existing.count++;
      if (doc.expiryDate && doc.expiryDate <= now) existing.expired++;
      if (doc.expiryDate && doc.expiryDate > now && doc.expiryDate <= thirtyDays) existing.expiring30++;
      typeMap.set(doc.type, existing);
    }

    const byType = Array.from(typeMap.entries()).map(([type, data]) => ({ type, ...data }));
    const totalExpired = byType.reduce((s, t) => s + t.expired, 0);
    const totalExpiring30 = byType.reduce((s, t) => s + t.expiring30, 0);

    return { totalExpired, totalExpiring30, byType };
  }

  static async getUserAccountSummary(companyId: string): Promise<{ summary: UserAccountSummary; accounts: UserAccountRow[] }> {
    const employees = await prisma.employee.findMany({
      where: { companyId },
      select: { userId: true },
    });
    const userIds = employees.map((e) => e.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, role: { not: "employee" } }, // Company-level roles
      orderBy: { createdAt: "desc" },
    });

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const pendingApproval = users.filter((u) => !u.isActive).length;

    // Try to get package max users from subscription features
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { clientId: true },
    });
    let maxAllowed = 10; // default
    if (company) {
      const subscription = await prisma.subscription.findFirst({
        where: { clientId: company.clientId, status: "active" },
        include: { plan: { select: { features: true } } },
      });
      if (subscription?.plan.features) {
        const maxUserFeature = subscription.plan.features.find((f) => f.startsWith("max_users:"));
        if (maxUserFeature) {
          maxAllowed = parseInt(maxUserFeature.split(":")[1] || "10", 10);
        }
      }
    }

    const remainingSlots = Math.max(0, maxAllowed - totalUsers);

    const summary: UserAccountSummary = { totalUsers, activeUsers, pendingApproval, maxAllowed, remainingSlots };

    const accounts: UserAccountRow[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      requiresApproval: !u.isActive,
    }));

    return { summary, accounts };
  }

  static async getAll(companyId: string): Promise<CompanyOperations> {
    const [attendance, documents, { summary: users, accounts: userAccounts }] = await Promise.all([
      this.getAttendanceSummary(companyId),
      this.getDocumentExpirySummary(companyId),
      this.getUserAccountSummary(companyId),
    ]);
    return { attendance, documents, users, userAccounts };
  }
}
