import { z } from "zod";
import { router, protectedProcedure, companyAdminProcedure } from "../trpc";
import { getAttendanceRecords, checkIn, checkOut, getAttendanceStats } from "../../services/attendance-service";

export const attendanceRouter = router({
  list: protectedProcedure
    .input(z.object({ take: z.number().optional(), skip: z.number().optional(), employeeId: z.string().optional() }))
    .query(async ({ input }) => getAttendanceRecords(input)),

  checkIn: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .mutation(async ({ input }) => checkIn(input.employeeId)),

  checkOut: protectedProcedure
    .input(z.object({ recordId: z.string() }))
    .mutation(async ({ input }) => checkOut(input.recordId)),

  stats: companyAdminProcedure
    .input(z.object({ employeeId: z.string().optional(), month: z.number().optional(), year: z.number().optional() }))
    .query(async ({ input }) => {
      if (!input.employeeId) throw new Error("employeeId is required");
      return getAttendanceStats(input.employeeId, input.month, input.year);
    }),
});
