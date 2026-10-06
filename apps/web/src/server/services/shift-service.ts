import { prisma } from "@intilaqa/db";

export function calculateOvertimeHours(regularHours: number, workedHours: number): number {
  return Math.max(0, workedHours - regularHours);
}

export async function getCompanyShifts(companyId: string) {
  return prisma.shift.findMany({
    where: { companyId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getShiftAssignments(companyId: string) {
  return prisma.shiftAssignment.findMany({
    where: { shift: { companyId } },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { name: true } },
        },
      },
      shift: true,
    },
    orderBy: { startDate: "desc" },
  });
}

export async function assignShift(
  employeeId: string,
  shiftId: string,
  startDate: Date,
  endDate?: Date
) {
  return prisma.shiftAssignment.create({
    data: { employeeId, shiftId, startDate, endDate },
    include: {
      employee: { select: { id: true, employeeId: true, user: { select: { name: true } } } },
      shift: true,
    },
  });
}

export async function createShift(data: {
  companyId: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  workingDays?: number;
  breakMinutes?: number;
}) {
  return prisma.shift.create({ data });
}

export async function updateShift(
  id: string,
  data: {
    name?: string;
    type?: string;
    startTime?: string;
    endTime?: string;
    workingDays?: number;
    breakMinutes?: number;
    isActive?: boolean;
  }
) {
  return prisma.shift.update({ where: { id }, data });
}

export async function getCompanyOvertimeRecords(companyId: string) {
  return prisma.overtimeRecord.findMany({
    where: { employee: { companyId } },
    include: {
      employee: {
        select: {
          id: true,
          employeeId: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function createOvertimeRecord(data: {
  employeeId: string;
  date: Date;
  regularHours: number;
  workedHours: number;
  notes?: string;
  rate?: number;
}) {
  const overtimeHours = calculateOvertimeHours(data.regularHours, data.workedHours);
  return prisma.overtimeRecord.create({
    data: {
      employeeId: data.employeeId,
      date: data.date,
      regularHours: data.regularHours,
      workedHours: data.workedHours,
      overtimeHours,
      hours: overtimeHours,
      rate: data.rate ?? 1.5,
      notes: data.notes,
      status: "pending",
      approvalStatus: "pending",
    },
  });
}

// Biometric integration placeholder
export class BiometricService {
  static async syncAttendance(deviceId: string): Promise<{ synced: number; failed: number }> {
    // Placeholder: In production, this would connect to biometric device API
    // and sync attendance records
    console.log(`[BiometricService] Sync requested for device: ${deviceId}`);
    return { synced: 0, failed: 0 };
  }

  static async registerEmployee(employeeId: string, deviceId: string): Promise<boolean> {
    console.log(`[BiometricService] Register employee ${employeeId} on device ${deviceId}`);
    return true;
  }

  static async getDeviceStatus(deviceId: string): Promise<"online" | "offline" | "error"> {
    return "offline";
  }
}
