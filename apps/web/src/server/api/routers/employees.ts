import { z } from "zod";
import { router, adminProcedure, companyAdminProcedure } from "../trpc";
import * as employeeService from "../../services/employee-service";

export const employeesRouter = router({
  list: companyAdminProcedure
    .input(z.object({ take: z.number().optional(), skip: z.number().optional(), search: z.string().optional(), companyId: z.string().optional(), departmentId: z.string().optional() }))
    .query(async ({ input }) => employeeService.getEmployees(input)),

  getById: companyAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => employeeService.getEmployeeById(input.id)),

  create: adminProcedure
    .input(z.object({ userId: z.string(), companyId: z.string(), departmentId: z.string().optional(), position: z.string().optional(), salary: z.number().optional(), employeeId: z.string().optional() }))
    .mutation(async ({ input }) => employeeService.createEmployee(input)),

  update: companyAdminProcedure
    .input(z.object({ id: z.string(), position: z.string().optional(), salary: z.number().optional(), departmentId: z.string().optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return employeeService.updateEmployee(id, data);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => employeeService.deleteEmployee(input.id)),

  stats: companyAdminProcedure
    .query(async () => employeeService.getEmployeeStats()),
});
