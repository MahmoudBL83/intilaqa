import { prisma } from "@intilaqa/db";

interface AttendanceStats {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalLateHours: number;
  attendancePercentage: number;
}

interface LateCalculation {
  minutes: number;
  hours: number;
  status: "on-time" | "late" | "very-late";
}

/**
 * Attendance Service
 * Handles attendance tracking, shift-based validation, and late arrival calculations
 */
export class AttendanceService {
  /**
   * Parse time string (HH:MM) to minutes
   */
  static parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1] || "0", 10);
    return hours * 60 + minutes;
  }

  /**
   * Calculate if employee was late and by how many minutes
   */
  static calculateLateArrival(
    checkInTime: string,
    shiftStartTime: string
  ): LateCalculation {
    const checkInMinutes = this.parseTimeToMinutes(checkInTime);
    const shiftMinutes = this.parseTimeToMinutes(shiftStartTime);

    // Allow 5-minute grace period
    const GRACE_PERIOD = 5;
    const lateMinutes = Math.max(0, checkInMinutes - shiftMinutes - GRACE_PERIOD);

    if (lateMinutes === 0) {
      return { minutes: 0, hours: 0, status: "on-time" };
    }

    if (lateMinutes <= 30) {
      return {
        minutes: lateMinutes,
        hours: lateMinutes / 60,
        status: "late",
      };
    }

    return {
      minutes: lateMinutes,
      hours: lateMinutes / 60,
      status: "very-late",
    };
  }

  /**
   * Get attendance records for an employee with shift comparison
   */
  static async getEmployeeAttendance(
    employeeId: string,
    fromDate?: Date,
    toDate?: Date
  ) {
    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: {
          gte: fromDate || new Date(new Date().getFullYear(), 0, 1),
          lte: toDate || new Date(),
        },
      },
      orderBy: { date: "desc" },
    });

    return records.map((record) => {
      const lateCalc = this.calculateLateArrival(
        record.checkIn?.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) || "08:00",
        "08:00"
      );

      return {
        ...record,
        lateMinutes: lateCalc.minutes,
        lateStatus: lateCalc.status,
      };
    });
  }

  /**
   * Get attendance statistics for an employee over a period
   */
  static async getAttendanceStats(
    employeeId: string,
    month?: number,
    year?: number
  ): Promise<AttendanceStats> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Get all days in the month
    const firstDay = new Date(targetYear, targetMonth - 1, 1);
    const lastDay = new Date(targetYear, targetMonth, 0);
    const totalDaysInMonth = lastDay.getDate();

    // Get attendance records for the month
    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    let presentDays = 0;
    let lateDays = 0;
    let totalLateMinutes = 0;

    records.forEach((record) => {
      if (record.status === "present") {
        presentDays++;
      } else if (record.status === "late") {
        lateDays++;
        if (record.checkIn) {
          const checkInTime = record.checkIn.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          });
          const lateCalc = this.calculateLateArrival(checkInTime, "08:00");
          totalLateMinutes += lateCalc.minutes;
        }
      }
    });

    const absentDays = totalDaysInMonth - presentDays - lateDays;
    const attendancePercentage = (presentDays / totalDaysInMonth) * 100;
    const totalLateHours = totalLateMinutes / 60;

    return {
      presentDays,
      absentDays,
      lateDays,
      totalLateHours,
      attendancePercentage: Math.round(attendancePercentage * 10) / 10,
    };
  }

  /**
   * Record check-in for an employee
   */
  static async recordCheckIn(
    employeeId: string,
    checkInTime?: string
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });

    if (existing) {
      console.warn("Employee already checked in today");
      return;
    }

    const now = new Date();
    const actualCheckInTime = checkInTime
      ? new Date(`2000-01-01T${checkInTime}`)
      : now;

    // Determine status based on time (default shift starts at 08:00)
    const defaultShiftStart = this.parseTimeToMinutes("08:00");
    const checkInMinutes = this.parseTimeToMinutes(
      actualCheckInTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const status =
      checkInMinutes - defaultShiftStart > 5 ? "late" : "present";

    await prisma.attendanceRecord.create({
      data: {
        date: today,
        checkIn: actualCheckInTime,
        status,
        employeeId,
      },
    });
  }

  /**
   * Record check-out for an employee
   */
  static async recordCheckOut(
    employeeId: string,
    checkOutTime?: string
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });

    if (!record) {
      throw new Error("No check-in record found for today");
    }

    const now = new Date();
    const actualCheckOutTime = checkOutTime
      ? new Date(`2000-01-01T${checkOutTime}`)
      : now;

    await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { checkOut: actualCheckOutTime },
    });
  }

  /**
   * Get total late hours for an employee (for payroll deduction)
   */
  static async getTotalLateHours(
    employeeId: string,
    month: number,
    year: number
  ): Promise<number> {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        status: "late",
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    let totalMinutes = 0;
    records.forEach((record) => {
      if (record.checkIn) {
        const checkInTime = record.checkIn.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });
        const lateCalc = this.calculateLateArrival(checkInTime, "08:00");
        totalMinutes += lateCalc.minutes;
      }
    });

    return totalMinutes / 60;
  }

  /**
   * Get absent days for an employee (for payroll deduction)
   */
  static async getAbsentDays(
    employeeId: string,
    month: number,
    year: number
  ): Promise<number> {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const totalDaysInMonth = lastDay.getDate();

    // Count total attendance records
    const attendanceCount = await prisma.attendanceRecord.count({
      where: {
        employeeId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    // Absent = total days - attendance records
    return Math.max(0, totalDaysInMonth - attendanceCount);
  }

  /**
   * Get all employees' attendance for a specific date (for daily reporting)
   */
  static async getDailyAttendanceReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            position: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { employee: { user: { name: "asc" } } },
    });

    return records;
  }

  /**
   * Calculate department-wide attendance statistics
   */
  static async getDepartmentAttendanceStats(
    departmentId: string,
    month?: number,
    year?: number
  ): Promise<{
    totalEmployees: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    averageAttendance: number;
  }> {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const firstDay = new Date(targetYear, targetMonth - 1, 1);
    const lastDay = new Date(targetYear, targetMonth, 0);

    const employees = await prisma.employee.findMany({
      where: { departmentId },
      select: { id: true },
    });

    const totalEmployees = employees.length;

    const records = await prisma.attendanceRecord.findMany({
      where: {
        employee: { departmentId },
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
    });

    const presentCount = records.filter(
      (r) => r.status === "present"
    ).length;
    const lateCount = records.filter((r) => r.status === "late").length;
    const absentCount =
      totalEmployees * lastDay.getDate() - presentCount - lateCount;

    const averageAttendance =
      totalEmployees > 0
        ? ((presentCount + lateCount) / (totalEmployees * lastDay.getDate())) *
          100
        : 0;

    return {
      totalEmployees,
      presentCount,
      absentCount,
      lateCount,
      averageAttendance: Math.round(averageAttendance * 10) / 10,
    };
  }
}

// Export for compatibility with existing code
export default AttendanceService;

// Legacy function exports for backward compatibility
export async function getAttendanceRecords(options?: { take?: number; skip?: number; employeeId?: string }) {
  const { take = 10, skip = 0, employeeId } = options || {};
  const where = employeeId ? { employeeId } : {};
  const [data, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where,
      take,
      skip,
      orderBy: { date: "desc" },
      include: { employee: { include: { user: { select: { name: true } } } } },
    }),
    prisma.attendanceRecord.count({ where }),
  ]);
  return { data, total };
}

// Additional function exports for backward compatibility
export async function checkIn(employeeId: string) {
  return AttendanceService.recordCheckIn(employeeId);
}

export async function checkOut(recordId: string) {
  // Get the record to extract necessary data
  const record = await prisma.attendanceRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Attendance record not found");
  const now = new Date();
  const checkOutTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return AttendanceService.recordCheckOut(record.employeeId, checkOutTime);
}

export async function getAttendanceStats(employeeId: string, month?: number, year?: number) {
  return AttendanceService.getAttendanceStats(employeeId, month, year);
}
